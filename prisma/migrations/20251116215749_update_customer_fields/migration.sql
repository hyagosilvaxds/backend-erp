/*
  Warnings:

  - You are about to drop the column `municipalRegistration` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer_addresses" ADD COLUMN     "ibgeCode" TEXT;

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "municipalRegistration";
