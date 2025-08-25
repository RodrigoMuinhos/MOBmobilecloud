-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TIMESTAMP(3),
    "telefone" TEXT,
    "cidade" TEXT,
    "estado" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "clienteId" TEXT NOT NULL,
    "produtos" JSONB NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoEstoque" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "marca" TEXT,
    "preco_compra" DOUBLE PRECISION NOT NULL,
    "preco_venda_unidade" DOUBLE PRECISION NOT NULL,
    "preco_venda_caixa" DOUBLE PRECISION,
    "quantidade_em_estoque" INTEGER NOT NULL,
    "unidades_por_caixa" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdutoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpf_key" ON "Cliente"("cpf");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
