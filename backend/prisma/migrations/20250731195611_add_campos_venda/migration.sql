/*
  Warnings:

  - You are about to drop the column `produtos` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `carrinho` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "produtos",
ADD COLUMN     "carrinho" JSONB NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "status_pagamento" TEXT;
