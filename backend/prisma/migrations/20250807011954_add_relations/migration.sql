/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `nascimento` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[filialId,codigo]` on the table `ProdutoEstoque` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filialId` to the `ProdutoEstoque` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Usuario` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `filialId` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMovimento" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'TRANSFERENCIA', 'VENDA');

-- AlterTable
ALTER TABLE "ProdutoEstoque" ADD COLUMN     "filialId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filialId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
DROP COLUMN "nascimento",
ADD COLUMN     "nascimento" TIMESTAMP(3),
ALTER COLUMN "whatsapp" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "filialId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Filial" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "corHex" TEXT,
    "icone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoEstoque" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoMovimento" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "saldoApos" INTEGER,
    "produtoId" TEXT NOT NULL,
    "filialId" TEXT NOT NULL,
    "vendaId" TEXT,
    "transferenciaId" TEXT,

    CONSTRAINT "MovimentoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferenciaEstoque" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produtoNome" TEXT NOT NULL,
    "produtoCodigo" TEXT,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "origemFilialId" TEXT NOT NULL,
    "destinoFilialId" TEXT NOT NULL,
    "produtoOrigemId" TEXT,
    "produtoDestinoId" TEXT,

    CONSTRAINT "TransferenciaEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filial_slug_key" ON "Filial"("slug");

-- CreateIndex
CREATE INDEX "MovimentoEstoque_filialId_data_idx" ON "MovimentoEstoque"("filialId", "data");

-- CreateIndex
CREATE INDEX "MovimentoEstoque_produtoId_data_idx" ON "MovimentoEstoque"("produtoId", "data");

-- CreateIndex
CREATE INDEX "TransferenciaEstoque_origemFilialId_data_idx" ON "TransferenciaEstoque"("origemFilialId", "data");

-- CreateIndex
CREATE INDEX "TransferenciaEstoque_destinoFilialId_data_idx" ON "TransferenciaEstoque"("destinoFilialId", "data");

-- CreateIndex
CREATE INDEX "ProdutoEstoque_filialId_idx" ON "ProdutoEstoque"("filialId");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoEstoque_filialId_codigo_key" ON "ProdutoEstoque"("filialId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_cpf_key" ON "Usuario"("cpf");

-- CreateIndex
CREATE INDEX "Usuario_filialId_idx" ON "Usuario"("filialId");

-- CreateIndex
CREATE INDEX "Venda_filialId_data_idx" ON "Venda"("filialId", "data");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "ProdutoEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_origemFilialId_fkey" FOREIGN KEY ("origemFilialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_destinoFilialId_fkey" FOREIGN KEY ("destinoFilialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_produtoOrigemId_fkey" FOREIGN KEY ("produtoOrigemId") REFERENCES "ProdutoEstoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferenciaEstoque" ADD CONSTRAINT "TransferenciaEstoque_produtoDestinoId_fkey" FOREIGN KEY ("produtoDestinoId") REFERENCES "ProdutoEstoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
