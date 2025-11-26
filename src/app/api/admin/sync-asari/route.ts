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
import { AsariStatus, Prisma } from '@/generated/client/client';
import { generateListingSlug } from '@/lib/utils';
import {
  formatDistrictName,
  normalizeLocation,
} from '@/lib/utils/district-normalization';
import { validateSyncToken } from '@/lib/api-auth';

const ASARI_IMAGE_BASE_URL_THUMBNAIL = 'https://img.asariweb.pl/thumbnail/';
const ASARI_IMAGE_BASE_URL_NORMAL = 'https://img.asariweb.pl/normal/';
const ASARI_IMAGE_BASE_URL_ORIGINAL = 'https://img.asariweb.pl/original/';
const CLOSED_LISTING_WINDOW_DAYS = 7;
const MAX_EXECUTION_TIME_MS = 270 * 1000; // 4.5 minutes

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

function trimOrNull(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function toOptionalString(value?: string | number | null): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return String(value);
}

function toOptionalNumber(value?: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function extractFirstNumber(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? match[0] : null;
}

function deriveStreetName(detail: AsariListingDetail): string | null {
  return trimOrNull(detail.street?.name);
}

function deriveStreetNumberFallback(detail: AsariListingDetail): string | null {
  return (
    extractFirstNumber(detail.location?.address) ??
    extractFirstNumber(detail.street?.fullName) ??
    null
  );
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

async function mapAsariDetailToPrismaListing(
  asariDetail: AsariListingDetail,
  effectiveLastUpdated: Date
): Promise<Prisma.ListingUpdateInput> {
  // Best-effort derivation of offer type when ASARI doesn't provide it directly
  const deriveOfferType = (detail: AsariListingDetail): string | null => {
    // ASARI docs: `section` contains canonical values like ApartmentSale, HouseRental, ...
    // Fallback to sectionName if section is empty
    const section =
      (typeof detail.section === 'string' && detail.section.trim()) ||
      (typeof detail.sectionName === 'string' && detail.sectionName.trim()) ||
      '';

    if (!section) return 'Unknown';

    // If it ends with Sale/Rental keep it verbatim, our filters use endsWith('Sale'|'Rental')
    if (/([A-Za-z]+)?(Sale|Rental)$/i.test(section)) return section;

    const lc = section.toLowerCase();
    if (lc.includes('rent')) return 'Rental';
    if (lc.includes('sale')) return 'Sale';

    return 'Unknown';
  };

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

  const streetNameForLocation = deriveStreetName(asariDetail);
  const streetNumberRaw = toOptionalNumber(asariDetail.houseNumber);
  const streetNumberFallbackStr = deriveStreetNumberFallback(asariDetail);
  const streetNumberFallback = streetNumberFallbackStr
    ? toOptionalNumber(streetNumberFallbackStr)
    : null;
  const streetNumberForNormalization = streetNumberRaw ?? streetNumberFallback;
  const flatNumber = toOptionalString(asariDetail.location?.flat_no);
  const normalizedCity = trimOrNull(asariDetail.location?.locality);
  const normalizedDistrict = normalizeLocation(
    normalizedCity,
    trimOrNull(asariDetail.location?.quarter),
    streetNameForLocation,
    streetNumberForNormalization?.toString() ?? null
  );
  const fallbackDistrict = trimOrNull(asariDetail.location?.quarter);
  const effectiveDistrict =
    normalizedDistrict ??
    (fallbackDistrict ? formatDistrictName(fallbackDistrict) : null);
  const streetNumberForStorage = streetNumberRaw ?? streetNumberFallback;
  const normalizedAddress = trimOrNull(asariDetail.location?.address);
  const normalizedVoivodeship = trimOrNull(asariDetail.location?.province);

  // Generate slug from the listing data
  const slug = generateListingSlug({
    propertyTypeId: null, // PropertyType not available in AsariListingDetail
    offerType: asariDetail.offerType,
    roomsCount: asariDetail.noOfRooms,
    locationCity: normalizedCity,
    locationDistrict: effectiveDistrict,
    asariId: asariDetail.id,
    listingIdString: asariDetail.listingId, // Use listingId to determine property type
  });

  const prismaListingData: Prisma.ListingUpdateInput = {
    asariId: asariDetail.id,
    slug,
    lastUpdatedAsari,
    asariStatus,
    offerType: deriveOfferType(asariDetail),
    virtualTourUrl: asariDetail.virtualTourUrl ?? null,
    isVisible,
    soldAt,
    isReservation: asariDetail.customField_32413 ?? null,
    title: asariDetail.headerAdvertisement,
    description: asariDetail.description,
    privateDescription: asariDetail.privateDescription,
    englishDescription: asariDetail.englishDescription,
    internalComment: asariDetail.internal_comment,
    exportId: asariDetail.export_id,
    price: asariDetail.price?.amount,
    pricePerM2: asariDetail.priceM2?.amount,
    locationAddress: normalizedAddress,
    locationCity: normalizedCity,
    locationDistrict: effectiveDistrict,
    locationStreet:
      streetNameForLocation ?? trimOrNull(asariDetail.street?.name),
    locationStreetNumber: streetNumberForStorage,
    locationFlatNumber: flatNumber,
    latitude: asariDetail.geoLat,
    longitude: asariDetail.geoLng,
    locationVoivodeship: normalizedVoivodeship,
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
      rawLocationDistrict: trimOrNull(asariDetail.location?.quarter),
      normalizedLocationDistrict: effectiveDistrict,
    },
  };

  // NOWA RELACJA: Znajdź agenta w tabeli Agent i połącz
  if (asariDetail.agent?.id) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { asariId: asariDetail.agent.id },
        select: { id: true },
      });

      if (agent) {
        prismaListingData.agent = {
          connect: { id: agent.id },
        };
      } else {
        console.warn(
          `[sync-asari] Agent with asariId ${asariDetail.agent.id} not found for listing ${asariDetail.id}`
        );
      }
    } catch (error) {
      console.error(
        `[sync-asari] Error connecting agent to listing ${asariDetail.id}:`,
        error
      );
    }
  }

  return prismaListingData;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let timeLimitReached = false;

  if (!validateSyncToken(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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
      if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) {
        console.warn(
          '[sync-asari] Time limit reached, stopping sync gracefully.'
        );
        timeLimitReached = true;
        break;
      }

      try {
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
          select: { lastUpdatedAsari: true, offerType: true },
        });

        const asariLastUpdatedDate = safeParseDate(
          asariListingInfo.lastUpdated
        );

        const needsOfferTypeBackfill =
          existingListing && !existingListing.offerType;

        if (
          asariLastUpdatedDate &&
          existingListing?.lastUpdatedAsari &&
          asariLastUpdatedDate <= existingListing.lastUpdatedAsari &&
          !needsOfferTypeBackfill
        ) {
          skippedCount++;
          continue;
        }

        console.log(
          `Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id}...`
        );
        await delay(2500);

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

        const prismaReadyData = await mapAsariDetailToPrismaListing(
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
      message: timeLimitReached
        ? 'Synchronizacja przerwana (limit czasu)'
        : 'Synchronizacja zakończona.',
      isPartial: timeLimitReached,
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
