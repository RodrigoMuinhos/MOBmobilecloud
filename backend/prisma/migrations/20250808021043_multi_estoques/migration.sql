/*
  Warnings:

  - A unique constraint covering the columns `[estoqueId,codigo]` on the table `ProdutoEstoque` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `estoqueId` to the `ProdutoEstoque` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProdutoEstoque" DROP CONSTRAINT "ProdutoEstoque_filialId_fkey";

-- DropIndex
DROP INDEX "ProdutoEstoque_filialId_codigo_key";

-- AlterTable
ALTER TABLE "ProdutoEstoque" ADD COLUMN     "estoqueId" TEXT NOT NULL,
ALTER COLUMN "filialId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Estoque" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT,
    "observacoes" TEXT,
    "filialId" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Estoque_filialId_idx" ON "Estoque"("filialId");

-- CreateIndex
CREATE INDEX "ProdutoEstoque_estoqueId_idx" ON "ProdutoEstoque"("estoqueId");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoEstoque_estoqueId_codigo_key" ON "ProdutoEstoque"("estoqueId", "codigo");

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_estoqueId_fkey" FOREIGN KEY ("estoqueId") REFERENCES "Estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
