-- CreateTable
CREATE TABLE "inss_tables" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "ranges" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inss_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fgts_tables" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "rates" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fgts_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrf_tables" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "dependentDeduction" DECIMAL(10,2) NOT NULL,
    "ranges" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrf_tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inss_tables_companyId_idx" ON "inss_tables"("companyId");

-- CreateIndex
CREATE INDEX "inss_tables_year_month_idx" ON "inss_tables"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "inss_tables_companyId_year_month_active_key" ON "inss_tables"("companyId", "year", "month", "active");

-- CreateIndex
CREATE INDEX "fgts_tables_companyId_idx" ON "fgts_tables"("companyId");

-- CreateIndex
CREATE INDEX "fgts_tables_year_month_idx" ON "fgts_tables"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "fgts_tables_companyId_year_month_active_key" ON "fgts_tables"("companyId", "year", "month", "active");

-- CreateIndex
CREATE INDEX "irrf_tables_companyId_idx" ON "irrf_tables"("companyId");

-- CreateIndex
CREATE INDEX "irrf_tables_year_month_idx" ON "irrf_tables"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "irrf_tables_companyId_year_month_active_key" ON "irrf_tables"("companyId", "year", "month", "active");

-- AddForeignKey
ALTER TABLE "inss_tables" ADD CONSTRAINT "inss_tables_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fgts_tables" ADD CONSTRAINT "fgts_tables_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrf_tables" ADD CONSTRAINT "irrf_tables_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
