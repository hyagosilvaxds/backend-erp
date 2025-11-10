-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "agencyNumber" TEXT NOT NULL,
    "agencyDigit" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountDigit" TEXT,
    "accountType" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "pixKey" TEXT,
    "initialBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isMainAccount" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "categoryId" TEXT,
    "type" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "documentNumber" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "accountPayableId" TEXT,
    "accountReceivableId" TEXT,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_payable" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "supplierName" TEXT NOT NULL,
    "supplierDocument" TEXT,
    "description" TEXT NOT NULL,
    "documentNumber" TEXT,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "parentId" TEXT,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "bankAccountId" TEXT,
    "centroCustoId" TEXT,
    "notes" TEXT,
    "attachments" TEXT[],
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts_receivable" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerDocument" TEXT,
    "customerId" TEXT,
    "description" TEXT NOT NULL,
    "documentNumber" TEXT,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "receivedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interestAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fineAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "competenceDate" TIMESTAMP(3) NOT NULL,
    "receiptDate" TIMESTAMP(3),
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "parentId" TEXT,
    "status" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "bankAccountId" TEXT,
    "centroCustoId" TEXT,
    "notes" TEXT,
    "attachments" TEXT[],
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_companyId_idx" ON "bank_accounts"("companyId");

-- CreateIndex
CREATE INDEX "bank_accounts_active_idx" ON "bank_accounts"("active");

-- CreateIndex
CREATE INDEX "financial_categories_companyId_idx" ON "financial_categories"("companyId");

-- CreateIndex
CREATE INDEX "financial_categories_type_idx" ON "financial_categories"("type");

-- CreateIndex
CREATE INDEX "financial_categories_active_idx" ON "financial_categories"("active");

-- CreateIndex
CREATE INDEX "financial_categories_parentId_idx" ON "financial_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_accountPayableId_key" ON "financial_transactions"("accountPayableId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_accountReceivableId_key" ON "financial_transactions"("accountReceivableId");

-- CreateIndex
CREATE INDEX "financial_transactions_companyId_idx" ON "financial_transactions"("companyId");

-- CreateIndex
CREATE INDEX "financial_transactions_bankAccountId_idx" ON "financial_transactions"("bankAccountId");

-- CreateIndex
CREATE INDEX "financial_transactions_categoryId_idx" ON "financial_transactions"("categoryId");

-- CreateIndex
CREATE INDEX "financial_transactions_type_idx" ON "financial_transactions"("type");

-- CreateIndex
CREATE INDEX "financial_transactions_transactionDate_idx" ON "financial_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "financial_transactions_competenceDate_idx" ON "financial_transactions"("competenceDate");

-- CreateIndex
CREATE INDEX "financial_transactions_reconciled_idx" ON "financial_transactions"("reconciled");

-- CreateIndex
CREATE INDEX "accounts_payable_companyId_idx" ON "accounts_payable"("companyId");

-- CreateIndex
CREATE INDEX "accounts_payable_categoryId_idx" ON "accounts_payable"("categoryId");

-- CreateIndex
CREATE INDEX "accounts_payable_status_idx" ON "accounts_payable"("status");

-- CreateIndex
CREATE INDEX "accounts_payable_dueDate_idx" ON "accounts_payable"("dueDate");

-- CreateIndex
CREATE INDEX "accounts_payable_paymentDate_idx" ON "accounts_payable"("paymentDate");

-- CreateIndex
CREATE INDEX "accounts_payable_centroCustoId_idx" ON "accounts_payable"("centroCustoId");

-- CreateIndex
CREATE INDEX "accounts_payable_isRecurring_idx" ON "accounts_payable"("isRecurring");

-- CreateIndex
CREATE INDEX "accounts_receivable_companyId_idx" ON "accounts_receivable"("companyId");

-- CreateIndex
CREATE INDEX "accounts_receivable_categoryId_idx" ON "accounts_receivable"("categoryId");

-- CreateIndex
CREATE INDEX "accounts_receivable_customerId_idx" ON "accounts_receivable"("customerId");

-- CreateIndex
CREATE INDEX "accounts_receivable_status_idx" ON "accounts_receivable"("status");

-- CreateIndex
CREATE INDEX "accounts_receivable_dueDate_idx" ON "accounts_receivable"("dueDate");

-- CreateIndex
CREATE INDEX "accounts_receivable_receiptDate_idx" ON "accounts_receivable"("receiptDate");

-- CreateIndex
CREATE INDEX "accounts_receivable_centroCustoId_idx" ON "accounts_receivable"("centroCustoId");

-- CreateIndex
CREATE INDEX "accounts_receivable_isRecurring_idx" ON "accounts_receivable"("isRecurring");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_accountPayableId_fkey" FOREIGN KEY ("accountPayableId") REFERENCES "accounts_payable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_accountReceivableId_fkey" FOREIGN KEY ("accountReceivableId") REFERENCES "accounts_receivable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_payable" ADD CONSTRAINT "accounts_payable_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts_payable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts_receivable" ADD CONSTRAINT "accounts_receivable_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts_receivable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
