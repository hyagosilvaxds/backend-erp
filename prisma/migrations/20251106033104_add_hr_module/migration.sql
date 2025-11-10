-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "costCenterId" TEXT,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "maritalStatus" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "zipCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "dismissalDate" TIMESTAMP(3),
    "contractType" TEXT NOT NULL,
    "workSchedule" TEXT,
    "salary" DECIMAL(15,2) NOT NULL,
    "bankCode" TEXT,
    "bankName" TEXT,
    "agency" TEXT,
    "account" TEXT,
    "accountType" TEXT,
    "pixKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earning_types" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "baseValue" DECIMAL(15,2),
    "hasINSS" BOOLEAN NOT NULL DEFAULT true,
    "hasFGTS" BOOLEAN NOT NULL DEFAULT true,
    "hasIRRF" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earning_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deduction_types" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "baseValue" DECIMAL(15,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deduction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_earnings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "earningTypeId" TEXT NOT NULL,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "value" DECIMAL(15,2),
    "percentage" DECIMAL(5,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalEarnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_items" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "baseSalary" DECIMAL(15,2) NOT NULL,
    "workDays" INTEGER NOT NULL DEFAULT 30,
    "earnings" JSONB NOT NULL,
    "totalEarnings" DECIMAL(15,2) NOT NULL,
    "deductions" JSONB NOT NULL,
    "totalDeductions" DECIMAL(15,2) NOT NULL,
    "netAmount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");

-- CreateIndex
CREATE INDEX "employees_costCenterId_idx" ON "employees"("costCenterId");

-- CreateIndex
CREATE INDEX "employees_active_idx" ON "employees"("active");

-- CreateIndex
CREATE INDEX "employees_cpf_idx" ON "employees"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "employees_companyId_cpf_key" ON "employees"("companyId", "cpf");

-- CreateIndex
CREATE INDEX "cost_centers_companyId_idx" ON "cost_centers"("companyId");

-- CreateIndex
CREATE INDEX "cost_centers_parentId_idx" ON "cost_centers"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_companyId_code_key" ON "cost_centers"("companyId", "code");

-- CreateIndex
CREATE INDEX "earning_types_companyId_idx" ON "earning_types"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "earning_types_companyId_code_key" ON "earning_types"("companyId", "code");

-- CreateIndex
CREATE INDEX "deduction_types_companyId_idx" ON "deduction_types"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "deduction_types_companyId_code_key" ON "deduction_types"("companyId", "code");

-- CreateIndex
CREATE INDEX "employee_earnings_employeeId_idx" ON "employee_earnings"("employeeId");

-- CreateIndex
CREATE INDEX "employee_earnings_earningTypeId_idx" ON "employee_earnings"("earningTypeId");

-- CreateIndex
CREATE INDEX "payrolls_companyId_idx" ON "payrolls"("companyId");

-- CreateIndex
CREATE INDEX "payrolls_status_idx" ON "payrolls"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_companyId_referenceMonth_referenceYear_type_key" ON "payrolls"("companyId", "referenceMonth", "referenceYear", "type");

-- CreateIndex
CREATE INDEX "payroll_items_payrollId_idx" ON "payroll_items"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_items_employeeId_idx" ON "payroll_items"("employeeId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earning_types" ADD CONSTRAINT "earning_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deduction_types" ADD CONSTRAINT "deduction_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_earnings" ADD CONSTRAINT "employee_earnings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_earnings" ADD CONSTRAINT "employee_earnings_earningTypeId_fkey" FOREIGN KEY ("earningTypeId") REFERENCES "earning_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
