-- 1) Remover FK antiga (se existir)
ALTER TABLE "CategoriaEstoque" DROP CONSTRAINT IF EXISTS "CategoriaEstoque_filialId_fkey";

-- 2) Normalizar valores inválidos:
--    - strings vazias ou apenas espaços -> NULL
UPDATE "CategoriaEstoque"
SET "filialId" = NULL
WHERE "filialId" IS NOT NULL
  AND (btrim("filialId") = '' OR "filialId" ~ '^\s+$');

-- 3) (opcional) Se você viu valores realmente não-UUID no diagnóstico,
--    comente-os ou trate manualmente antes do cast. Exemplo:
-- UPDATE "CategoriaEstoque" SET "filialId" = NULL WHERE "filialId" IN ('valor-errado-1', 'valor-errado-2');

-- 4) Alterar o tipo para UUID (faz cast de TEXT->UUID)
ALTER TABLE "CategoriaEstoque"
  ALTER COLUMN "filialId" TYPE uuid
  USING NULLIF(btrim("filialId"), '')::uuid;

-- 5) Recriar a FK e validar
ALTER TABLE "CategoriaEstoque"
  ADD CONSTRAINT "CategoriaEstoque_filialId_fkey"
  FOREIGN KEY ("filialId") REFERENCES "Filial"("id")
  ON UPDATE CASCADE ON DELETE SET NULL NOT VALID;

ALTER TABLE "CategoriaEstoque" VALIDATE CONSTRAINT "CategoriaEstoque_filialId_fkey";