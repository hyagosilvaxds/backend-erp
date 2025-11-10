/*
  Warnings:

  - You are about to drop the column `month` on the `fgts_tables` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `inss_tables` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `irrf_tables` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId,year,active]` on the table `fgts_tables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,year,active]` on the table `inss_tables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,year,active]` on the table `irrf_tables` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."fgts_tables_companyId_year_month_active_key";

-- DropIndex
DROP INDEX "public"."fgts_tables_year_month_idx";

-- DropIndex
DROP INDEX "public"."inss_tables_companyId_year_month_active_key";

-- DropIndex
DROP INDEX "public"."inss_tables_year_month_idx";

-- DropIndex
DROP INDEX "public"."irrf_tables_companyId_year_month_active_key";

-- DropIndex
DROP INDEX "public"."irrf_tables_year_month_idx";

-- AlterTable
ALTER TABLE "fgts_tables" DROP COLUMN "month";

-- AlterTable
ALTER TABLE "inss_tables" DROP COLUMN "month";

-- AlterTable
ALTER TABLE "irrf_tables" DROP COLUMN "month";

-- CreateIndex
CREATE INDEX "fgts_tables_year_idx" ON "fgts_tables"("year");

-- CreateIndex
CREATE UNIQUE INDEX "fgts_tables_companyId_year_active_key" ON "fgts_tables"("companyId", "year", "active");

-- CreateIndex
CREATE INDEX "inss_tables_year_idx" ON "inss_tables"("year");

-- CreateIndex
CREATE UNIQUE INDEX "inss_tables_companyId_year_active_key" ON "inss_tables"("companyId", "year", "active");

-- CreateIndex
CREATE INDEX "irrf_tables_year_idx" ON "irrf_tables"("year");

-- CreateIndex
CREATE UNIQUE INDEX "irrf_tables_companyId_year_active_key" ON "irrf_tables"("companyId", "year", "active");
