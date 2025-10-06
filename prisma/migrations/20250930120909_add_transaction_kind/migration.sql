-- CreateEnum
CREATE TYPE "public"."ListingTransactionKind" AS ENUM ('Sale', 'Rent');

-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "transactionKind" "public"."ListingTransactionKind";
