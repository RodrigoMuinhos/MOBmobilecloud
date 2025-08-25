-- CreateTable
CREATE TABLE "Usuario" (
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "nascimento" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("cpf")
);
