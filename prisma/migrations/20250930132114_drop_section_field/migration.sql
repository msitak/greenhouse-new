/*
  Warnings:

  - You are about to drop the column `section` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `transactionKind` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `transactionTypeId` on the `Listing` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Listing_transactionTypeId_idx";

-- AlterTable
ALTER TABLE "public"."Listing" DROP COLUMN "section",
DROP COLUMN "transactionKind",
DROP COLUMN "transactionTypeId";

-- DropEnum
DROP TYPE "public"."ListingTransactionKind";
