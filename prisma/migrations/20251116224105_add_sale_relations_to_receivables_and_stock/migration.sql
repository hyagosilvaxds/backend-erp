-- AlterTable
ALTER TABLE "accounts_receivable" ADD COLUMN     "saleId" TEXT;

-- AlterTable
ALTER TABLE "product_stock_movements" ADD COLUMN     "saleId" TEXT;

-- CreateIndex
CREATE INDEX "accounts_receivable_saleId_idx" ON "accounts_receivable"("saleId");

-- CreateIndex
CREATE INDEX "product_stock_movements_saleId_idx" ON "product_stock_movements"("saleId");

-- AddForeignKey
ALTER TABLE "product_stock_movements" ADD CONSTRAINT "product_stock_movements_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
