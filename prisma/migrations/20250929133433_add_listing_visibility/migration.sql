-- AlterTable
ALTER TABLE "public"."Listing" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "soldAt" TIMESTAMP(3);
