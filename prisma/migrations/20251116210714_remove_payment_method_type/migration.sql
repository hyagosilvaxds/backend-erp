/*
  Warnings:

  - You are about to drop the column `type` on the `payment_methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "type";

-- DropEnum
DROP TYPE "public"."PaymentMethodType";
