/*
  Warnings:

  - Made the column `tipo` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `marca` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preco_venda_caixa` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unidades_por_caixa` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `codigo` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoriaId` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `caixas` on table `ProdutoEstoque` required. This step will fail if there are existing NULL values in that column.
  - Made the column `whatsapp` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nascimento` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `formaPagamento` on table `Venda` required. This step will fail if there are existing NULL values in that column.
  - Made the column `observacoes` on table `Venda` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `status_pagamento` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "MovimentoEstoque" DROP CONSTRAINT "MovimentoEstoque_filialId_fkey";

-- DropForeignKey
ALTER TABLE "MovimentoEstoque" DROP CONSTRAINT "MovimentoEstoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "ProdutoEstoque" DROP CONSTRAINT "ProdutoEstoque_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaEstoque" DROP CONSTRAINT "TransferenciaEstoque_destinoFilialId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaEstoque" DROP CONSTRAINT "TransferenciaEstoque_origemFilialId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaEstoque" DROP CONSTRAINT "TransferenciaEstoque_produtoDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "TransferenciaEstoque" DROP CONSTRAINT "TransferenciaEstoque_produtoOrigemId_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_filialId_fkey";

-- AlterTable
ALTER TABLE "ProdutoEstoque" ALTER COLUMN "tipo" SET NOT NULL,
ALTER COLUMN "marca" SET NOT NULL,
ALTER COLUMN "preco_venda_caixa" SET NOT NULL,
ALTER COLUMN "unidades_por_caixa" SET NOT NULL,
ALTER COLUMN "codigo" SET NOT NULL,
ALTER COLUMN "categoriaId" SET NOT NULL,
ALTER COLUMN "caixas" SET NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "whatsapp" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "nascimento" SET NOT NULL;

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "formaPagamento" SET NOT NULL,
ALTER COLUMN "observacoes" SET NOT NULL,
DROP COLUMN "status_pagamento",
ADD COLUMN     "status_pagamento" "StatusPagamento" NOT NULL;

-- CreateIndex
CREATE INDEX "Filial_nome_idx" ON "Filial"("nome");

-- CreateIndex
CREATE INDEX "Filial_uf_idx" ON "Filial"("uf");

-- CreateIndex
CREATE INDEX "ProdutoEstoque_categoriaId_idx" ON "ProdutoEstoque"("categoriaId");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "ProdutoEstoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_origemFilialId_fkey" FOREIGN KEY ("origemFilialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_destinoFilialId_fkey" FOREIGN KEY ("destinoFilialId") REFERENCES "Filial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_produtoOrigemId_fkey" FOREIGN KEY ("produtoOrigemId") REFERENCES "ProdutoEstoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_produtoDestinoId_fkey" FOREIGN KEY ("produtoDestinoId") REFERENCES "ProdutoEstoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;
