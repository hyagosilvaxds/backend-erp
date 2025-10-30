-- CreateTable
CREATE TABLE "centros_custo" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "centroCustoPaiId" TEXT,
    "nivel" INTEGER NOT NULL,
    "responsavel" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centros_custo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "centros_custo_companyId_idx" ON "centros_custo"("companyId");

-- CreateIndex
CREATE INDEX "centros_custo_centroCustoPaiId_idx" ON "centros_custo"("centroCustoPaiId");

-- CreateIndex
CREATE INDEX "centros_custo_codigo_idx" ON "centros_custo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "centros_custo_companyId_codigo_key" ON "centros_custo"("companyId", "codigo");

-- AddForeignKey
ALTER TABLE "centros_custo" ADD CONSTRAINT "centros_custo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centros_custo" ADD CONSTRAINT "centros_custo_centroCustoPaiId_fkey" FOREIGN KEY ("centroCustoPaiId") REFERENCES "centros_custo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
