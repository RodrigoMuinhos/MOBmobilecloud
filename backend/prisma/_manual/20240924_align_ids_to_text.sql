-- ===== 20240924_align_ids_to_text.sql =====
-- Objetivo: padronizar *referências* para TEXT (igual a Filial.id e Usuario.id atuais)
-- Assim as FKs voltam a funcionar imediatamente.

-- 0) Derrubar FKs antigas que envolvam filialId/vendedorId
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname, (conrelid::regclass)::text AS tbl
    FROM pg_constraint
    WHERE contype='f' AND (conname ILIKE '%filialId_fkey' OR conname ILIKE '%vendedorId_fkey')
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 1) Converter colunas filialId/vendedorId para TEXT (idempotente)
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public'
      AND column_name IN ('filialId','vendedorId')
      AND data_type <> 'text'
  LOOP
    -- Converte para TEXT (preservando NULLs)
    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE text USING %I::text',
      c.table_schema, c.table_name, c.column_name, c.column_name
    );
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 2) Recriar FKs padronizadas (TEXT → TEXT)
-- 2a) filialId → Filial(id)
DO $$
DECLARE c record;
DECLARE fkname text;
BEGIN
  FOR c IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='filialId' AND data_type='text'
  LOOP
    fkname := format('%s_filialId_fkey', c.table_name);
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', c.table_schema, c.table_name, fkname);
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON UPDATE CASCADE ON DELETE SET NULL NOT VALID',
      c.table_schema, c.table_name, fkname
    );
    EXECUTE format('ALTER TABLE %I.%I VALIDATE CONSTRAINT %I', c.table_schema, c.table_name, fkname);
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 2b) vendedorId → Usuario(id)
DO $$
DECLARE c record;
DECLARE fkname text;
BEGIN
  FOR c IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='vendedorId' AND data_type='text'
  LOOP
    fkname := format('%s_vendedorId_fkey', c.table_name);
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', c.table_schema, c.table_name, fkname);
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON UPDATE CASCADE ON DELETE SET NULL NOT VALID',
      c.table_schema, c.table_name, fkname
    );
    EXECUTE format('ALTER TABLE %I.%I VALIDATE CONSTRAINT %I', c.table_schema, c.table_name, fkname);
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 3) Índices úteis (idempotentes)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Venda' AND column_name='vendedorId') THEN
    CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda" ("vendedorId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Venda' AND column_name='filialId') THEN
    CREATE INDEX IF NOT EXISTS "Venda_filialId_idx" ON "Venda" ("filialId");
  END IF;
END $$ LANGUAGE plpgsql;