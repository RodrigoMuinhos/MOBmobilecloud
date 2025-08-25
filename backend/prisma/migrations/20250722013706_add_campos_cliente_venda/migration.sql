/*
  Warnings:

  - You are about to drop the column `clienteId` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `produtos` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `acrescimo` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carrinho` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteCPF` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteCep` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteEndereco` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteNascimento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteNome` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteWpp` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataVenda` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descontoPercentual` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descontoValor` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinoDesconto` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formaPagamento` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frete` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parcelas` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFinal` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_clienteId_fkey";

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "clienteId",
DROP COLUMN "produtos",
DROP COLUMN "status",
DROP COLUMN "total",
ADD COLUMN     "acrescimo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "carrinho" JSONB NOT NULL,
ADD COLUMN     "clienteCPF" TEXT NOT NULL,
ADD COLUMN     "clienteCep" TEXT NOT NULL,
ADD COLUMN     "clienteEndereco" TEXT NOT NULL,
ADD COLUMN     "clienteNascimento" TEXT NOT NULL,
ADD COLUMN     "clienteNome" TEXT NOT NULL,
ADD COLUMN     "clienteWpp" TEXT NOT NULL,
ADD COLUMN     "dataVenda" TEXT NOT NULL,
ADD COLUMN     "descontoPercentual" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "descontoValor" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "destinoDesconto" TEXT NOT NULL,
ADD COLUMN     "formaPagamento" TEXT NOT NULL,
ADD COLUMN     "frete" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "parcelas" INTEGER NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalFinal" DOUBLE PRECISION NOT NULL;
