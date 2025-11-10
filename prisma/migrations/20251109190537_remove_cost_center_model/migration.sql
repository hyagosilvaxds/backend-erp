/*
  Warnings:

  - You are about to drop the `cost_centers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."cost_centers" DROP CONSTRAINT "cost_centers_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cost_centers" DROP CONSTRAINT "cost_centers_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."employees" DROP CONSTRAINT "employees_costCenterId_fkey";

-- DropTable
DROP TABLE "public"."cost_centers";

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "centros_custo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
