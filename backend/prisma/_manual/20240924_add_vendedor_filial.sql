-- ===== 20240924_add_vendedor_filial_fix.sql =====

-- 1) Adicionar colunas (se não existirem) como NULLABLE primeiro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Venda' AND column_name = 'vendedorId'
  ) THEN
    ALTER TABLE "Venda" ADD COLUMN "vendedorId" uuid;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Venda' AND column_name = 'filialId'
  ) THEN
    ALTER TABLE "Venda" ADD COLUMN "filialId" uuid;
  END IF;
END$$;

-- 2) Constraints de FK (NOT VALID + VALIDATE) para não travar tabela grande
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Venda_vendedorId_fkey'
  ) THEN
    ALTER TABLE "Venda"
      ADD CONSTRAINT "Venda_vendedorId_fkey"
      FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id")
      ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;
    ALTER TABLE "Venda" VALIDATE CONSTRAINT "Venda_vendedorId_fkey";
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Venda_filialId_fkey'
  ) THEN
    ALTER TABLE "Venda"
      ADD CONSTRAINT "Venda_filialId_fkey"
      FOREIGN KEY ("filialId") REFERENCES "Filial"("id")
      ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;
    ALTER TABLE "Venda" VALIDATE CONSTRAINT "Venda_filialId_fkey";
  END IF;
END$$;

-- 3) Índices auxiliares (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda" ("vendedorId");
CREATE INDEX IF NOT EXISTS "Venda_filialId_idx"   ON "Venda" ("filialId");

-- 4) Tornar NOT NULL *apenas* se já estiver tudo preenchido
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Venda" WHERE "vendedorId" IS NULL) THEN
    ALTER TABLE "Venda" ALTER COLUMN "vendedorId" SET NOT NULL;
  ELSE
    RAISE NOTICE 'Coluna "vendedorId" ainda contém NULLs; mantendo como NULLABLE.';
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Venda" WHERE "filialId" IS NULL) THEN
    ALTER TABLE "Venda" ALTER COLUMN "filialId" SET NOT NULL;
  ELSE
    RAISE NOTICE 'Coluna "filialId" ainda contém NULLs; mantendo como NULLABLE.';
  END IF;
END$$;
