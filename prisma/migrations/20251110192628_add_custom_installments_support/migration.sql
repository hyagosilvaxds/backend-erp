-- CreateTable
CREATE TABLE "payment_installment_templates" (
    "id" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "daysToPayment" INTEGER NOT NULL,
    "percentageOfTotal" DOUBLE PRECISION NOT NULL,
    "fixedAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_installment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_installments" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_installments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_installment_templates_paymentMethodId_idx" ON "payment_installment_templates"("paymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_installment_templates_paymentMethodId_installmentNu_key" ON "payment_installment_templates"("paymentMethodId", "installmentNumber");

-- CreateIndex
CREATE INDEX "sale_installments_saleId_idx" ON "sale_installments"("saleId");

-- CreateIndex
CREATE INDEX "sale_installments_status_idx" ON "sale_installments"("status");

-- CreateIndex
CREATE INDEX "sale_installments_dueDate_idx" ON "sale_installments"("dueDate");

-- AddForeignKey
ALTER TABLE "payment_installment_templates" ADD CONSTRAINT "payment_installment_templates_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_installments" ADD CONSTRAINT "sale_installments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
