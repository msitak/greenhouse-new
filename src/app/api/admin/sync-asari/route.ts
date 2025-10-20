import { NextResponse } from 'next/server';
import {
  fetchExportedListingIds,
  fetchListingDetails,
} from '@/services/asariApi';
import {
  AsariListingDetail,
  AsariListingIdEntry,
} from '@/services/asariApi.types';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@prisma/client';
import { generateListingSlug } from '@/lib/utils';

const ASARI_IMAGE_BASE_URL_THUMBNAIL = 'https://img.asariweb.pl/thumbnail/';
const ASARI_IMAGE_BASE_URL_NORMAL = 'https://img.asariweb.pl/normal/';
const ASARI_IMAGE_BASE_URL_ORIGINAL = 'https://img.asariweb.pl/original/';
const CLOSED_LISTING_WINDOW_DAYS = 7;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function safeParseDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    const millis = dateInput.getTime();
    return Number.isNaN(millis) ? null : new Date(millis);
  }

  const parsed = new Date(dateInput);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function deriveVisibility(
  status: AsariStatus,
  lastUpdated: Date
): { isVisible: boolean; soldAt: Date | null } {
  switch (status) {
    case AsariStatus.Closed:
      return { isVisible: true, soldAt: lastUpdated };
    case AsariStatus.Active:
      return { isVisible: true, soldAt: null };
    default:
      return { isVisible: false, soldAt: null };
  }
}

// Transaction kind derivation removed as unused

function mapAsariDetailToPrismaListing(
  asariDetail: AsariListingDetail,
  effectiveLastUpdated: Date
): Prisma.ListingUpdateInput {
  const mapStatus = (status?: string | null): AsariStatus => {
    if (!status) {
      return AsariStatus.Unknown;
    }

    // Tworzymy tablicę wszystkich możliwych wartości z naszego enuma
    const validStatuses = Object.values(AsariStatus);

    // Sprawdzamy, czy otrzymany status (po konwersji do odpowiedniej wielkości liter)
    // znajduje się w tablicy dozwolonych statusów.
    // Używamy `capitalize` aby dopasować do definicji enuma (np. 'Active', a nie 'ACTIVE')
    const capitalize = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const formattedStatus = capitalize(status);

    if (validStatuses.includes(formattedStatus as AsariStatus)) {
      return formattedStatus as AsariStatus;
    }

    // Jeśli nie, logujemy i zwracamy Unknown
    console.warn(
      `Nieznany status z API ASARI: "${status}". Przypisano "Unknown".`
    );
    return AsariStatus.Unknown;
  };

  const asariStatus = mapStatus(asariDetail.status);
  const lastUpdatedAsari =
    safeParseDate(asariDetail.lastUpdated) ?? effectiveLastUpdated;
  const { isVisible, soldAt } = deriveVisibility(asariStatus, lastUpdatedAsari);

  // Generate slug from the listing data
  const slug = generateListingSlug({
    propertyTypeId: null, // PropertyType not available in AsariListingDetail
    offerType: asariDetail.offerType,
    roomsCount: asariDetail.noOfRooms,
    locationCity: asariDetail.location?.locality,
    locationDistrict: asariDetail.location?.quarter,
    asariId: asariDetail.id,
    listingIdString: asariDetail.listingId, // Use listingId to determine property type
  });

  const prismaListingData: Prisma.ListingUpdateInput = {
    asariId: asariDetail.id,
    slug,
    lastUpdatedAsari,
    asariStatus,
    offerType: asariDetail.offerType ?? null,
    virtualTourUrl: asariDetail.virtualTourUrl ?? null,
    isVisible,
    soldAt,
    title: asariDetail.headerAdvertisement,
    description: asariDetail.description,
    privateDescription: asariDetail.privateDescription,
    englishDescription: asariDetail.englishDescription,
    internalComment: asariDetail.internal_comment,
    exportId: asariDetail.export_id,
    price: asariDetail.price?.amount,
    pricePerM2: asariDetail.priceM2?.amount,
    locationCity: asariDetail.location?.locality,
    locationDistrict: asariDetail.location?.quarter,
    locationStreet: asariDetail.street?.name,
    latitude: asariDetail.geoLat,
    longitude: asariDetail.geoLng,
    locationVoivodeship: asariDetail.location?.province,
    area: asariDetail.totalArea || asariDetail.lotArea,
    roomsCount: asariDetail.noOfRooms,
    floor: asariDetail.floorNo,
    floorCount: asariDetail.noOfFloors,
    propertyDetailsJson: {
      lotArea: asariDetail.lotArea,
      lotForm: asariDetail.lotForm,
      lotShape: asariDetail.lotShape,
      lotType: asariDetail.lotType,
      zoningPlan: asariDetail.zoningPlan,
      possibleDevelopmentPercent: asariDetail.possibleDevelopmentPercent,
      overallHeight: asariDetail.overallHeight,
      groundOwnershipType: asariDetail.groundOwnershipType,
      waterTypeList: asariDetail.waterTypeList,
      electricityStatus: asariDetail.electricityStatus,
      gasStatus: asariDetail.gasStatus,
      sewerageTypeList: asariDetail.sewerageTypeList,
      urbanCo: asariDetail.urbanCo,
      activeBuildingPermit: asariDetail.activeBuildingPermit,
      issuedBuildingConditions: asariDetail.issuedBuildingConditions,
      elevator: asariDetail.elevator,
      condition: asariDetail.condition,
      buildingType: asariDetail.buildingType,
      material: asariDetail.material,
      apartmentTypeList: asariDetail.apartmentTypeList,
      heatingTypeList: asariDetail.heatingTypeList,
      hotWaterList: asariDetail.hotWaterList,
      kitchenType: asariDetail.kitchenType,
      exchange: asariDetail.exchange,
      communicationList: asariDetail.communicationList,
      availableNeighborhoodList: asariDetail.availableNeighborhoodList,
      vacantFromDate: asariDetail.vacantFromDate,
      videoUrl: asariDetail.videoUrl,
      drivewayType: asariDetail.drivewayType,
      encloseType: asariDetail.encloseType,
      dividingPossibility: asariDetail.dividingPossibility,
      plotDimension: asariDetail.plotDimension,
      intercom: asariDetail.intercom,
      sharedOwnership: asariDetail.sharedOwnership,
      groundSharedOwnership: asariDetail.groundSharedOwnership,
      ownListing: asariDetail.ownListing,
    },
    agentAsariId: asariDetail.agent?.id,
    agentName:
      `${asariDetail.agent?.firstName || ''} ${asariDetail.agent?.lastName || ''}`.trim(),
    agentPhone: asariDetail.agent?.phoneNumber,
    agentEmail: asariDetail.agent?.email,
    agentSkypeUser: asariDetail.agent?.skypeUser,
    agentImageAsariId: asariDetail.agent?.imageId,
    parentListingAsariId:
      typeof asariDetail.parentListing?.listingId === 'string'
        ? asariDetail.parentListing.listingId
        : typeof asariDetail.parentListingId === 'number'
          ? String(asariDetail.parentListingId)
          : null,
    createdAtSystem: safeParseDate(asariDetail.dateCreated),
    updatedAtSystem: safeParseDate(asariDetail.actualisationDate),
    additionalDetailsJson: {
      contractType: asariDetail.contractType,
      listingIdString: asariDetail.listingId,
      mortgageMarket: asariDetail.mortgageMarket,
    },
  };

  return prismaListingData;
}

export async function POST() {
  console.log('Rozpoczynanie synchronizacji ofert z Asari...');
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let archivedCount = 0;
  let errorCount = 0;

  try {
    const asariIdsResponse = await fetchExportedListingIds(
      CLOSED_LISTING_WINDOW_DAYS
    );
    if (!asariIdsResponse.success || !asariIdsResponse.data) {
      throw new Error('Nie udało się pobrać listy ID ofert z Asari.');
    }

    const allAsariListingsInfo = asariIdsResponse.data.map(
      (entry: AsariListingIdEntry) => ({
        id: entry.id,
        lastUpdated: safeParseDate(entry.lastUpdated) ?? new Date(),
      })
    );
    console.log(
      `Pobrano ${allAsariListingsInfo.length} informacji o ofertach z Asari.`
    );
    const activeAsariIdsSet = new Set(
      allAsariListingsInfo.map(info => info.id)
    );

    const localActiveListings = await prisma.listing.findMany({
      where: { asariStatus: 'Active' },
      select: { asariId: true },
    });
    const localActiveAsariIds = localActiveListings.map(l => l.asariId);
    const idsToArchive = localActiveAsariIds.filter(
      id => !activeAsariIdsSet.has(id)
    );

    if (idsToArchive.length > 0) {
      console.log(
        `Znaleziono ${idsToArchive.length} ofert do archiwizacji: ${idsToArchive.join(', ')}`
      );

      const archiveResult = await prisma.listing.updateMany({
        where: { asariId: { in: idsToArchive } },
        data: {
          asariStatus: AsariStatus.Archived,
          isVisible: false,
          soldAt: null,
        },
      });

      archivedCount = archiveResult.count;
      console.log(`Zarchiwizowano ${archivedCount} ofert.`);
    }

    for (const asariListingInfo of allAsariListingsInfo) {
      try {
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
          select: { lastUpdatedAsari: true },
        });

        const asariLastUpdatedDate = safeParseDate(
          asariListingInfo.lastUpdated
        );

        if (
          asariLastUpdatedDate &&
          existingListing?.lastUpdatedAsari &&
          asariLastUpdatedDate <= existingListing.lastUpdatedAsari
        ) {
          skippedCount++;
          continue;
        }

        console.log(
          `Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id}...`
        );
        await delay(3000);

        const detailsResponse = await fetchListingDetails(asariListingInfo.id);
        if (!detailsResponse.success || !detailsResponse.data) {
          console.error(
            `Błąd pobierania szczegółów dla Asari ID: ${asariListingInfo.id}.`
          );
          errorCount++;
          continue;
        }
        const listingDataFromAsari: AsariListingDetail = detailsResponse.data;
        const effectiveLastUpdated = safeParseDate(
          listingDataFromAsari.lastUpdated
        );
        const persistedLastUpdated =
          effectiveLastUpdated || asariLastUpdatedDate;

        const prismaReadyData = mapAsariDetailToPrismaListing(
          listingDataFromAsari,
          persistedLastUpdated || new Date()
        );
        const imagesToCreate =
          listingDataFromAsari.images?.map(img => ({
            asariId: img.id,
            urlThumbnail: `${ASARI_IMAGE_BASE_URL_THUMBNAIL}${img.id}`,
            urlNormal: `${ASARI_IMAGE_BASE_URL_NORMAL}${img.id}`,
            urlOriginal: `${ASARI_IMAGE_BASE_URL_ORIGINAL}${img.id}`,
            description: img.description,
            order: img.order,
            isScheme: img.isScheme || false,
          })) || [];

        const createData = {
          ...prismaReadyData,
          images: {
            create: imagesToCreate,
          },
        };

        const updateData = {
          ...prismaReadyData,
          images: {
            deleteMany: {},
            create: imagesToCreate,
          },
        };

        await prisma.listing.upsert({
          where: { asariId: listingDataFromAsari.id },
          update: updateData,
          create: createData as Prisma.ListingCreateInput,
        });

        if (existingListing) {
          updatedCount++;
        } else {
          createdCount++;
        }
      } catch (errorForSingleListing) {
        console.error(
          `Błąd przetwarzania oferty Asari ID: ${asariListingInfo.id}:`,
          (errorForSingleListing as Error).message
        );
        errorCount++;
      }
    }

    console.log('Synchronizacja zakończona.');
    console.log(
      `Podsumowanie: Stworzono: ${createdCount}, Zaktualizowano: ${updatedCount}, Pominięto: ${skippedCount}, Zarchiwizowano: ${archivedCount}, Błędy: ${errorCount}`
    );

    return NextResponse.json({
      message: 'Synchronizacja zakończona.',
      totalAsariOffers: allAsariListingsInfo.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      archived: archivedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error(
      'Krytyczny błąd podczas synchronizacji:',
      (error as Error).message,
      (error as Error).stack
    );
    return NextResponse.json(
      {
        message: 'Błąd podczas synchronizacji',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('Rozłączono Prisma Client.');
  }
}
