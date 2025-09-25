-- ===== 20240924_add_vendedor_filial_nodo.sql =====

-- 1) Colunas (idempotente)
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "vendedorId" uuid;
ALTER TABLE "Venda" ADD COLUMN IF NOT EXISTS "filialId"   uuid;

-- 2) FKs: derruba se existir e recria (idempotente e seguro)
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

-- 3) Índices
CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda" ("vendedorId");
CREATE INDEX IF NOT EXISTS "Venda_filialId_idx"   ON "Venda" ("filialId");

-- 4) (Opcional) Só faça NOT NULL depois que popular valores nas linhas antigas:
-- ALTER TABLE "Venda" ALTER COLUMN "vendedorId" SET NOT NULL;
-- ALTER TABLE "Venda" ALTER COLUMN "filialId"   SET NOT NULL;