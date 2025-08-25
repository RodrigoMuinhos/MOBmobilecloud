-- CreateTable
CREATE TABLE "MembroExtra" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "comissao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salvo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MembroExtra_pkey" PRIMARY KEY ("id")
);
