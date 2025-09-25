-- ===== 20240924_cast_filial_vendedor_uuid_and_refk.sql =====

-- (garantia) extensões utilitárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0) GARANTIR TABELAS-ALVO têm PK como UUID (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Usuario'
      AND column_name='id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "Usuario" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
  END IF;
END $$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Filial'
      AND column_name='id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "Filial" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
  END IF;
END $$ LANGUAGE plpgsql;

-- 1) DROPAR FKs antigas que envolvam filialId/vendedorId (nomes padrão *_filialId_fkey / *_vendedorId_fkey)
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

-- 2) CONVERTER colunas filialId/vendedorId que não sejam UUID para UUID
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public'
      AND column_name IN ('filialId','vendedorId')
      AND data_type <> 'uuid'
  LOOP
    -- tenta converter fazendo cast direto ::uuid
    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE uuid USING NULLIF(%I, '''')::uuid',
      c.table_schema, c.table_name, c.column_name, c.column_name
    );
  END LOOP;
END $$ LANGUAGE plpgsql;

-- 3) GARANTIR que colunas existam nas tabelas-chave (idempotente)
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "vendedorId" uuid;
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "filialId"   uuid;

-- 4) RECRIAR FKs padronizadas para TODAS as tabelas que possuem filialId/vendedorId como uuid

-- 4a) Para filialId -> Filial(id)
DO $$
DECLARE c record;
DECLARE fkname text;
BEGIN
  FOR c IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='filialId' AND data_type='uuid'
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

-- 4b) Para vendedorId -> Usuario(id)
DO $$
DECLARE c record;
DECLARE fkname text;
BEGIN
  FOR c IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND column_name='vendedorId' AND data_type='uuid'
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

-- 5) Índices úteis
CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda" ("vendedorId");
CREATE INDEX IF NOT EXISTS "Venda_filialId_idx"   ON "Venda" ("filialId");