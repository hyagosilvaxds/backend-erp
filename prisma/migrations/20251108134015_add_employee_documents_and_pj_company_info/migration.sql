-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "companyCity" TEXT,
ADD COLUMN     "companyComplement" TEXT,
ADD COLUMN     "companyDocument" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyMunicipalRegistration" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyNeighborhood" TEXT,
ADD COLUMN     "companyNumber" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "companyState" TEXT,
ADD COLUMN     "companyStateRegistration" TEXT,
ADD COLUMN     "companyStreet" TEXT,
ADD COLUMN     "companyTradeName" TEXT,
ADD COLUMN     "companyZipCode" TEXT;

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_idx" ON "employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_documents_documentType_idx" ON "employee_documents"("documentType");

-- CreateIndex
CREATE INDEX "employee_documents_verified_idx" ON "employee_documents"("verified");

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
