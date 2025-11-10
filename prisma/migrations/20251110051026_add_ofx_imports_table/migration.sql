-- CreateTable
CREATE TABLE "ofx_imports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "bankId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "balanceDate" TIMESTAMP(3) NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "importedCount" INTEGER NOT NULL,
    "duplicateCount" INTEGER NOT NULL,
    "reconciledCount" INTEGER NOT NULL DEFAULT 0,
    "transactions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "errorMessage" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedBy" TEXT,

    CONSTRAINT "ofx_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ofx_imports_companyId_idx" ON "ofx_imports"("companyId");

-- CreateIndex
CREATE INDEX "ofx_imports_bankAccountId_idx" ON "ofx_imports"("bankAccountId");

-- CreateIndex
CREATE INDEX "ofx_imports_startDate_idx" ON "ofx_imports"("startDate");

-- CreateIndex
CREATE INDEX "ofx_imports_endDate_idx" ON "ofx_imports"("endDate");

-- CreateIndex
CREATE INDEX "ofx_imports_importedAt_idx" ON "ofx_imports"("importedAt");

-- AddForeignKey
ALTER TABLE "ofx_imports" ADD CONSTRAINT "ofx_imports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofx_imports" ADD CONSTRAINT "ofx_imports_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
