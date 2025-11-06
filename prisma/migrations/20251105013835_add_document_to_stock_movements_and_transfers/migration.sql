-- AlterTable
ALTER TABLE "product_stock_movements" ADD COLUMN     "documentId" TEXT;

-- AlterTable
ALTER TABLE "stock_transfers" ADD COLUMN     "documentId" TEXT;

-- AddForeignKey
ALTER TABLE "product_photos" ADD CONSTRAINT "product_photos_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stock_movements" ADD CONSTRAINT "product_stock_movements_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
