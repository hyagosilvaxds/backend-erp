-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "logoFileName" TEXT,
ADD COLUMN     "logoMimeType" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "planoContasId" TEXT;

-- CreateTable
CREATE TABLE "plano_contas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Gerencial',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plano_contas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_contabeis" (
    "id" TEXT NOT NULL,
    "planoContasId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "natureza" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "contaPaiId" TEXT,
    "aceitaLancamento" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_contabeis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contas_contabeis_planoContasId_codigo_key" ON "contas_contabeis"("planoContasId", "codigo");

-- AddForeignKey
ALTER TABLE "contas_contabeis" ADD CONSTRAINT "contas_contabeis_planoContasId_fkey" FOREIGN KEY ("planoContasId") REFERENCES "plano_contas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_contabeis" ADD CONSTRAINT "contas_contabeis_contaPaiId_fkey" FOREIGN KEY ("contaPaiId") REFERENCES "contas_contabeis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
