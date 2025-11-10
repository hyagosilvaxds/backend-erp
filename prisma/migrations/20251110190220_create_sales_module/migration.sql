-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_SLIP', 'BANK_TRANSFER', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('QUOTE', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CreditAnalysisStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MANUAL');

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "allowInstallments" BOOLEAN NOT NULL DEFAULT false,
    "maxInstallments" INTEGER NOT NULL DEFAULT 1,
    "installmentFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiresCreditAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "minCreditScore" DOUBLE PRECISION,
    "daysToReceive" INTEGER NOT NULL DEFAULT 0,
    "transactionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'QUOTE',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherChargesDesc" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethodId" TEXT,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "installmentValue" DOUBLE PRECISION,
    "creditAnalysisRequired" BOOLEAN NOT NULL DEFAULT false,
    "creditAnalysisStatus" "CreditAnalysisStatus",
    "creditAnalysisDate" TIMESTAMP(3),
    "creditAnalysisNotes" TEXT,
    "creditScore" DOUBLE PRECISION,
    "useCustomerAddress" BOOLEAN NOT NULL DEFAULT true,
    "deliveryAddress" JSONB,
    "notes" TEXT,
    "internalNotes" TEXT,
    "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stockLocationId" TEXT,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productUnit" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_companyId_idx" ON "payment_methods"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_companyId_code_key" ON "payment_methods"("companyId", "code");

-- CreateIndex
CREATE INDEX "sales_companyId_idx" ON "sales"("companyId");

-- CreateIndex
CREATE INDEX "sales_customerId_idx" ON "sales"("customerId");

-- CreateIndex
CREATE INDEX "sales_status_idx" ON "sales"("status");

-- CreateIndex
CREATE INDEX "sales_quoteDate_idx" ON "sales"("quoteDate");

-- CreateIndex
CREATE UNIQUE INDEX "sales_companyId_code_key" ON "sales"("companyId", "code");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_stockLocationId_fkey" FOREIGN KEY ("stockLocationId") REFERENCES "stock_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
