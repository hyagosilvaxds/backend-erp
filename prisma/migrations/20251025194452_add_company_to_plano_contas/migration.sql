-- AlterTable
ALTER TABLE "plano_contas" ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE INDEX "plano_contas_companyId_idx" ON "plano_contas"("companyId");

-- AddForeignKey
ALTER TABLE "plano_contas" ADD CONSTRAINT "plano_contas_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
