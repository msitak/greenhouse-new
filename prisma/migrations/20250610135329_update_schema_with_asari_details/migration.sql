-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "asariId" INTEGER NOT NULL,
    "lastUpdatedAsari" INTEGER NOT NULL,
    "exportId" TEXT,
    "statusId" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "englishDescription" TEXT,
    "internalComment" TEXT,
    "price" DOUBLE PRECISION,
    "priceCurrencyId" INTEGER,
    "pricePerM2" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "locationCity" TEXT,
    "locationDistrict" TEXT,
    "locationStreet" TEXT,
    "locationStreetNumber" TEXT,
    "locationFlatNumber" TEXT,
    "locationPostalCode" TEXT,
    "locationCountryId" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationVoivodeship" TEXT,
    "locationCounty" TEXT,
    "locationCommunity" TEXT,
    "propertyTypeId" INTEGER,
    "area" DOUBLE PRECISION,
    "roomsCount" INTEGER,
    "floor" INTEGER,
    "floorCount" INTEGER,
    "buildYear" INTEGER,
    "buildingMaterialId" INTEGER,
    "windowTypeId" INTEGER,
    "heatingTypeId" INTEGER,
    "transactionTypeId" INTEGER,
    "marketTypeId" INTEGER,
    "agentAsariId" INTEGER,
    "agentName" TEXT,
    "agentSurname" TEXT,
    "agentPhone" TEXT,
    "agentEmail" TEXT,
    "agentSkypeUser" TEXT,
    "agentImageAsariId" INTEGER,
    "parentListingAsariId" TEXT,
    "createdAtSystem" TIMESTAMP(3),
    "updatedAtSystem" TIMESTAMP(3),
    "additionalDetailsJson" JSONB,
    "dbCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dbUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "asariId" INTEGER NOT NULL,
    "urlThumbnail" TEXT NOT NULL,
    "urlNormal" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "listingId" TEXT NOT NULL,
    "dbCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dbUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryValue" (
    "id" TEXT NOT NULL,
    "dictionaryKey" TEXT NOT NULL,
    "asariDictId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DictionaryValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "I18nMessage" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "I18nMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_asariId_key" ON "Listing"("asariId");

-- CreateIndex
CREATE INDEX "Listing_asariId_idx" ON "Listing"("asariId");

-- CreateIndex
CREATE INDEX "Listing_locationCity_idx" ON "Listing"("locationCity");

-- CreateIndex
CREATE INDEX "Listing_propertyTypeId_idx" ON "Listing"("propertyTypeId");

-- CreateIndex
CREATE INDEX "Listing_transactionTypeId_idx" ON "Listing"("transactionTypeId");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_area_idx" ON "Listing"("area");

-- CreateIndex
CREATE UNIQUE INDEX "ListingImage_asariId_key" ON "ListingImage"("asariId");

-- CreateIndex
CREATE INDEX "ListingImage_asariId_idx" ON "ListingImage"("asariId");

-- CreateIndex
CREATE INDEX "DictionaryValue_dictionaryKey_locale_idx" ON "DictionaryValue"("dictionaryKey", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryValue_dictionaryKey_asariDictId_locale_key" ON "DictionaryValue"("dictionaryKey", "asariDictId", "locale");

-- CreateIndex
CREATE INDEX "I18nMessage_locale_idx" ON "I18nMessage"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "I18nMessage_locale_key_key" ON "I18nMessage"("locale", "key");

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
