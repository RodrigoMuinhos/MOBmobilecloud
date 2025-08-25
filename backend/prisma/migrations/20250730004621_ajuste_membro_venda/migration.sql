/*
  Warnings:

  - You are about to drop the `MembroExtra` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "data" DROP DEFAULT,
ALTER COLUMN "acrescimo" DROP NOT NULL,
ALTER COLUMN "descontoPercentual" DROP NOT NULL,
ALTER COLUMN "descontoValor" DROP NOT NULL,
ALTER COLUMN "destinoDesconto" DROP NOT NULL,
ALTER COLUMN "formaPagamento" DROP NOT NULL,
ALTER COLUMN "frete" DROP NOT NULL,
ALTER COLUMN "parcelas" DROP NOT NULL;

-- DropTable
DROP TABLE "MembroExtra";
