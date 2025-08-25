-- AlterTable
ALTER TABLE "ProdutoEstoque" ADD COLUMN     "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "CategoriaEstoque" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "CategoriaEstoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProdutoEstoque" ADD CONSTRAINT "ProdutoEstoque_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaEstoque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
