/*
  Warnings:

  - You are about to drop the column `telefone` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "telefone",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "whatsapp" TEXT;
