-- CreateEnum
CREATE TYPE "AsariStatus" AS ENUM ('Active', 'Cancelled', 'Closed', 'Pending', 'Draft', 'Unknown');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "asariStatus" "AsariStatus" NOT NULL DEFAULT 'Draft';

-- CreateIndex
CREATE INDEX "Listing_asariStatus_idx" ON "Listing"("asariStatus");
