-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "certificadoDigitalValidoAte" TIMESTAMP(3),
ADD COLUMN     "nfeAmbiente" TEXT NOT NULL DEFAULT '2',
ADD COLUMN     "proximoNumeroNFe" INTEGER DEFAULT 1,
ADD COLUMN     "responsibleEmail" TEXT,
ADD COLUMN     "responsibleName" TEXT,
ADD COLUMN     "responsiblePhone" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "aliqCofins" DECIMAL(5,2),
ADD COLUMN     "aliqIcms" DECIMAL(5,2),
ADD COLUMN     "aliqPis" DECIMAL(5,2),
ADD COLUMN     "bcCofins" DECIMAL(10,2),
ADD COLUMN     "bcPis" DECIMAL(10,2),
ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "csosn" TEXT,
ADD COLUMN     "cstCofins" TEXT,
ADD COLUMN     "cstIcms" TEXT,
ADD COLUMN     "cstPis" TEXT,
ADD COLUMN     "modBcIcms" TEXT,
ADD COLUMN     "origem" TEXT;
