-- ===== 20240924_fix_id_uuid_and_fks.sql =====

-- 0) Garantir extensão de UUID (opcional, mas inofensivo)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Converter Usuario.id para UUID se ainda for TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Usuario'
      AND column_name='id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "Usuario" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
  END IF;
END $$ LANGUAGE plpgsql;

-- 2) Converter Filial.id para UUID se ainda for TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Filial'
      AND column_name='id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "Filial" ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
  END IF;
END $$ LANGUAGE plpgsql;

-- 3) Garantir colunas na Venda como UUID (já estão), mas por idempotência:
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "vendedorId" uuid;
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "filialId"   uuid;

-- 4) Recriar FKs (NOT VALID + VALIDATE)
ALTER TABLE "Venda" DROP CONSTRAINT IF EXISTS "Venda_vendedorId_fkey";
ALTER TABLE "Venda"
  ADD CONSTRAINT "Venda_vendedorId_fkey"
  FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id")
  ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;
ALTER TABLE "Venda" VALIDATE CONSTRAINT "Venda_vendedorId_fkey";

ALTER TABLE "Venda" DROP CONSTRAINT IF EXISTS "Venda_filialId_fkey";
ALTER TABLE "Venda"
  ADD CONSTRAINT "Venda_filialId_fkey"
  FOREIGN KEY ("filialId") REFERENCES "Filial"("id")
  ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;
ALTER TABLE "Venda" VALIDATE CONSTRAINT "Venda_filialId_fkey";

-- 5) Índices
CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda" ("vendedorId");
CREATE INDEX IF NOT EXISTS "Venda_filialId_idx"   ON "Venda" ("filialId");