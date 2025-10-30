-- AlterTable
ALTER TABLE "document_folders" ADD COLUMN     "allowedRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "allowedRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "documents_previousVersionId_idx" ON "documents"("previousVersionId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
