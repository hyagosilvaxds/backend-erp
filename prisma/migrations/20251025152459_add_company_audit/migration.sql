-- CreateTable
CREATE TABLE "company_audits" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'Company',
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_audits_companyId_idx" ON "company_audits"("companyId");

-- CreateIndex
CREATE INDEX "company_audits_userId_idx" ON "company_audits"("userId");

-- CreateIndex
CREATE INDEX "company_audits_action_idx" ON "company_audits"("action");

-- CreateIndex
CREATE INDEX "company_audits_createdAt_idx" ON "company_audits"("createdAt");

-- AddForeignKey
ALTER TABLE "company_audits" ADD CONSTRAINT "company_audits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_audits" ADD CONSTRAINT "company_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
