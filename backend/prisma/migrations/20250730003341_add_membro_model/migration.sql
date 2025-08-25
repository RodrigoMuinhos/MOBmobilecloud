-- CreateTable
CREATE TABLE "Membro" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "avatar" TEXT,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "comissao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salvo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Membro_pkey" PRIMARY KEY ("id")
);
