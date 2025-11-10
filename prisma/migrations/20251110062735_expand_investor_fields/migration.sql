/*
  Warnings:

  - You are about to drop the column `address` on the `investors` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `investors` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `investors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."investors_companyId_document_key";

-- DropIndex
DROP INDEX "public"."investors_document_idx";

-- AlterTable
ALTER TABLE "investors" DROP COLUMN "address",
DROP COLUMN "document",
DROP COLUMN "name",
ADD COLUMN     "accountDigit" TEXT,
ADD COLUMN     "addressProofUrl" TEXT,
ADD COLUMN     "addressType" TEXT,
ADD COLUMN     "agencyDigit" TEXT,
ADD COLUMN     "alternativeEmail" TEXT,
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "cnpjDocUrl" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Brasil',
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "cpfDocUrl" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "foundedDate" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "identityDocUrl" TEXT,
ADD COLUMN     "incomeProofUrl" TEXT,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "investmentGoal" TEXT,
ADD COLUMN     "investorCode" TEXT,
ADD COLUMN     "investorProfile" TEXT,
ADD COLUMN     "isAccreditedInvestor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastContactDate" TIMESTAMP(3),
ADD COLUMN     "legalNature" TEXT,
ADD COLUMN     "legalRepDocument" TEXT,
ADD COLUMN     "legalRepName" TEXT,
ADD COLUMN     "legalRepRole" TEXT,
ADD COLUMN     "mailingAddressSame" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mailingCity" TEXT,
ADD COLUMN     "mailingComplement" TEXT,
ADD COLUMN     "mailingCountry" TEXT,
ADD COLUMN     "mailingNeighborhood" TEXT,
ADD COLUMN     "mailingNumber" TEXT,
ADD COLUMN     "mailingState" TEXT,
ADD COLUMN     "mailingStreet" TEXT,
ADD COLUMN     "mailingZipCode" TEXT,
ADD COLUMN     "mainActivity" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "mobilePhone" TEXT,
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "municipalRegistration" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "patrimony" DOUBLE PRECISION,
ADD COLUMN     "pixKeyType" TEXT,
ADD COLUMN     "privacyPolicyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "rgIssuer" TEXT,
ADD COLUMN     "socialContractUrl" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "statusReason" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "tradeName" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- CreateIndex
CREATE INDEX "investors_cpf_idx" ON "investors"("cpf");

-- CreateIndex
CREATE INDEX "investors_cnpj_idx" ON "investors"("cnpj");

-- CreateIndex
CREATE INDEX "investors_investorCode_idx" ON "investors"("investorCode");

-- CreateIndex
CREATE INDEX "investors_status_idx" ON "investors"("status");

-- CreateIndex
CREATE INDEX "investors_email_idx" ON "investors"("email");
