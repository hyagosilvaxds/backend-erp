-- CreateTable
CREATE TABLE "investors" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "bankName" TEXT,
    "bankCode" TEXT,
    "agencyNumber" TEXT,
    "accountNumber" TEXT,
    "accountType" TEXT,
    "pixKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scp_projects" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "investedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "distributedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scp_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "investmentDate" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "documentNumber" TEXT,
    "paymentMethod" TEXT,
    "bankAccountId" TEXT,
    "financialTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_policies" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PROPORCIONAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "baseValue" DOUBLE PRECISION NOT NULL,
    "referenceNumber" TEXT,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "paymentDate" TIMESTAMP(3),
    "bankAccountId" TEXT,
    "financialTransactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "irrf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investors_companyId_idx" ON "investors"("companyId");

-- CreateIndex
CREATE INDEX "investors_document_idx" ON "investors"("document");

-- CreateIndex
CREATE INDEX "investors_active_idx" ON "investors"("active");

-- CreateIndex
CREATE UNIQUE INDEX "investors_companyId_document_key" ON "investors"("companyId", "document");

-- CreateIndex
CREATE INDEX "scp_projects_companyId_idx" ON "scp_projects"("companyId");

-- CreateIndex
CREATE INDEX "scp_projects_status_idx" ON "scp_projects"("status");

-- CreateIndex
CREATE INDEX "scp_projects_active_idx" ON "scp_projects"("active");

-- CreateIndex
CREATE UNIQUE INDEX "scp_projects_companyId_code_key" ON "scp_projects"("companyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "investments_financialTransactionId_key" ON "investments"("financialTransactionId");

-- CreateIndex
CREATE INDEX "investments_companyId_idx" ON "investments"("companyId");

-- CreateIndex
CREATE INDEX "investments_projectId_idx" ON "investments"("projectId");

-- CreateIndex
CREATE INDEX "investments_investorId_idx" ON "investments"("investorId");

-- CreateIndex
CREATE INDEX "investments_investmentDate_idx" ON "investments"("investmentDate");

-- CreateIndex
CREATE INDEX "investments_status_idx" ON "investments"("status");

-- CreateIndex
CREATE INDEX "distribution_policies_companyId_idx" ON "distribution_policies"("companyId");

-- CreateIndex
CREATE INDEX "distribution_policies_projectId_idx" ON "distribution_policies"("projectId");

-- CreateIndex
CREATE INDEX "distribution_policies_investorId_idx" ON "distribution_policies"("investorId");

-- CreateIndex
CREATE INDEX "distribution_policies_active_idx" ON "distribution_policies"("active");

-- CreateIndex
CREATE UNIQUE INDEX "distributions_financialTransactionId_key" ON "distributions"("financialTransactionId");

-- CreateIndex
CREATE INDEX "distributions_companyId_idx" ON "distributions"("companyId");

-- CreateIndex
CREATE INDEX "distributions_projectId_idx" ON "distributions"("projectId");

-- CreateIndex
CREATE INDEX "distributions_investorId_idx" ON "distributions"("investorId");

-- CreateIndex
CREATE INDEX "distributions_distributionDate_idx" ON "distributions"("distributionDate");

-- CreateIndex
CREATE INDEX "distributions_competenceDate_idx" ON "distributions"("competenceDate");

-- CreateIndex
CREATE INDEX "distributions_status_idx" ON "distributions"("status");

-- AddForeignKey
ALTER TABLE "investors" ADD CONSTRAINT "investors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scp_projects" ADD CONSTRAINT "scp_projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "scp_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES "financial_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_policies" ADD CONSTRAINT "distribution_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_policies" ADD CONSTRAINT "distribution_policies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "scp_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_policies" ADD CONSTRAINT "distribution_policies_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "scp_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES "financial_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
