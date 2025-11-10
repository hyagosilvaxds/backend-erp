-- AlterTable
ALTER TABLE "accounts_payable" ADD COLUMN     "contaContabilId" TEXT;

-- AlterTable
ALTER TABLE "accounts_receivable" ADD COLUMN     "contaContabilId" TEXT;

-- AlterTable
ALTER TABLE "financial_transactions" ADD COLUMN     "centroCustoId" TEXT,
ADD COLUMN     "contaContabilId" TEXT;

-- CreateIndex
CREATE INDEX "financial_transactions_centroCustoId_idx" ON "financial_transactions"("centroCustoId");

-- CreateIndex
CREATE INDEX "financial_transactions_contaContabilId_idx" ON "financial_transactions"("contaContabilId");

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_contaContabilId_fkey" FOREIGN KEY ("contaContabilId") REFERENCES "contas_contabeis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_contaContabilId_fkey" FOREIGN KEY ("contaContabilId") REFERENCES "contas_contabeis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_contaContabilId_fkey" FOREIGN KEY ("contaContabilId") REFERENCES "contas_contabeis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
