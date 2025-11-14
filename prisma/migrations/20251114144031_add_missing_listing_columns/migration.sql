-- Add missing columns to Listing table
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "virtualTourUrl" TEXT;
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "propertyDetailsJson" JSONB;

-- Add unique constraint and index for slug
CREATE UNIQUE INDEX IF NOT EXISTS "Listing_slug_key" ON "Listing"("slug");
CREATE INDEX IF NOT EXISTS "Listing_slug_idx" ON "Listing"("slug");

