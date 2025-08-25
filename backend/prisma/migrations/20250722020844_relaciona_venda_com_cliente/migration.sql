/*
  Warnings:

  - You are about to drop the column `clienteCPF` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteCep` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteEndereco` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteNascimento` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteNome` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `clienteWpp` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `dataVenda` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "clienteCPF",
DROP COLUMN "clienteCep",
DROP COLUMN "clienteEndereco",
DROP COLUMN "clienteNascimento",
DROP COLUMN "clienteNome",
DROP COLUMN "clienteWpp",
DROP COLUMN "dataVenda",
ADD COLUMN     "clienteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
