/*
  Warnings:

  - A unique constraint covering the columns `[marca,tipo]` on the table `CategoriaEstoque` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProdutoEstoque" ADD COLUMN     "caixas" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEstoque_marca_tipo_key" ON "CategoriaEstoque"("marca", "tipo");
