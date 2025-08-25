/*
  Warnings:

  - A unique constraint covering the columns `[marca,tipo,filialId]` on the table `CategoriaEstoque` will be added. If there are existing duplicate values, this will fail.
  - Made the column `filialId` on table `CategoriaEstoque` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "CategoriaEstoque_marca_tipo_key";

-- AlterTable
ALTER TABLE "CategoriaEstoque" ALTER COLUMN "filialId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CategoriaEstoque_filialId_idx" ON "CategoriaEstoque"("filialId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEstoque_marca_tipo_filialId_key" ON "CategoriaEstoque"("marca", "tipo", "filialId");

-- AddForeignKey
ALTER TABLE "CategoriaEstoque" ADD CONSTRAINT "CategoriaEstoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
