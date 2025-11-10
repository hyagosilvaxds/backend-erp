-- CreateTable
CREATE TABLE "employee_deductions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "deductionTypeId" TEXT NOT NULL,
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "value" DECIMAL(15,2),
    "percentage" DECIMAL(5,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_deductions_employeeId_idx" ON "employee_deductions"("employeeId");

-- CreateIndex
CREATE INDEX "employee_deductions_deductionTypeId_idx" ON "employee_deductions"("deductionTypeId");

-- AddForeignKey
ALTER TABLE "employee_deductions" ADD CONSTRAINT "employee_deductions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_deductions" ADD CONSTRAINT "employee_deductions_deductionTypeId_fkey" FOREIGN KEY ("deductionTypeId") REFERENCES "deduction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
