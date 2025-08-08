import { NextResponse } from 'next/server';
import { fetchExportedListingIds, fetchListingDetails } from '@/services/asariApi';
import { AsariListingDetail } from '@/services/asariApi.types';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@prisma/client';

const ASARI_IMAGE_BASE_URL_THUMBNAIL = "https://img.asariweb.pl/thumbnail/";
const ASARI_IMAGE_BASE_URL_NORMAL = "https://img.asariweb.pl/normal/";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapAsariDetailToPrismaListing(
  asariDetail: AsariListingDetail,
  currentTimestamp: Date
): Prisma.ListingUpdateInput {
  const parseAsariDate = (dateString?: string | null): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
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
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const formattedStatus = capitalize(status);
  
    if (validStatuses.includes(formattedStatus as AsariStatus)) {
      return formattedStatus as AsariStatus;
    }
    
    // Jeśli nie, logujemy i zwracamy Unknown
    console.warn(`Nieznany status z API ASARI: "${status}". Przypisano "Unknown".`);
    return AsariStatus.Unknown;
  };

  const prismaListingData: Prisma.ListingUpdateInput = {
    asariId: asariDetail.id,
    lastUpdatedAsari: parseAsariDate(asariDetail.lastUpdated) || currentTimestamp,
    asariStatus: mapStatus(asariDetail.status),
    title: asariDetail.headerAdvertisement,
    description: asariDetail.description,
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
    offerType: asariDetail.section,
    agentAsariId: asariDetail.agent?.id,
    agentName: `${asariDetail.agent?.firstName || ''} ${asariDetail.agent?.lastName || ''}`.trim(),
    agentPhone: asariDetail.agent?.phoneNumber,
    agentEmail: asariDetail.agent?.email,
    agentSkypeUser: asariDetail.agent?.skypeUser,
    agentImageAsariId: asariDetail.agent?.imageId,
    parentListingAsariId: typeof asariDetail.parentListing?.listingId === 'string' 
                            ? asariDetail.parentListing.listingId 
                            : (typeof asariDetail.parentListingId === 'number'
                                ? String(asariDetail.parentListingId) 
                                : null),
    createdAtSystem: parseAsariDate(asariDetail.dateCreated),
    updatedAtSystem: parseAsariDate(asariDetail.actualisationDate),
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
    const asariIdsResponse = await fetchExportedListingIds();
    if (!asariIdsResponse.success || !asariIdsResponse.data) {
      throw new Error('Nie udało się pobrać listy ID ofert z Asari.');
    }

    const allAsariListingsInfo: { id: number; lastUpdated: Date }[] = asariIdsResponse.data;
    console.log(`Pobrano ${allAsariListingsInfo.length} informacji o ofertach z Asari.`);
    const activeAsariIdsSet = new Set(allAsariListingsInfo.map(info => info.id));

    const localActiveListings = await prisma.listing.findMany({
      where: { asariStatus: 'Active' },
      select: { asariId: true },
    });
    const localActiveAsariIds = localActiveListings.map(l => l.asariId);
    const idsToArchive = localActiveAsariIds.filter(id => !activeAsariIdsSet.has(id));

    if (idsToArchive.length > 0) {
      console.log(`Znaleziono ${idsToArchive.length} ofert do archiwizacji: ${idsToArchive.join(', ')}`);
      const archiveResult = await prisma.listing.updateMany({
        where: { asariId: { in: idsToArchive } },
        data: { asariStatus: 'Archived' },
      });
      archivedCount = archiveResult.count;
      console.log(`Zarchiwizowano ${archivedCount} ofert.`);
    }

    for (const asariListingInfo of allAsariListingsInfo) {
      try {
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
          select: { lastUpdatedAsari: true }
        });

        const asariLastUpdatedDate = asariListingInfo.lastUpdated;

        if (existingListing && existingListing.lastUpdatedAsari && asariLastUpdatedDate <= existingListing.lastUpdatedAsari) {
          skippedCount++;
          continue;
        }

        console.log(`Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id}...`);
        await delay(3000);

        const detailsResponse = await fetchListingDetails(asariListingInfo.id);
        if (!detailsResponse.success || !detailsResponse.data) {
          console.error(`Błąd pobierania szczegółów dla Asari ID: ${asariListingInfo.id}.`);
          errorCount++;
          continue;
        }
        const listingDataFromAsari: AsariListingDetail = detailsResponse.data;
        const effectiveLastUpdated = listingDataFromAsari.lastUpdated ? new Date(listingDataFromAsari.lastUpdated) : asariLastUpdatedDate;
        
        const prismaReadyData = mapAsariDetailToPrismaListing(listingDataFromAsari, effectiveLastUpdated);
        const imagesToCreate = 
          listingDataFromAsari.images?.map(img => ({
            asariId: img.id,
            urlThumbnail: `${ASARI_IMAGE_BASE_URL_THUMBNAIL}${img.id}`,
            urlNormal: `${ASARI_IMAGE_BASE_URL_NORMAL}${img.id}`,
            description: img.description,
            order: img.order,
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

      } catch (errorForSingleListing: any) {
        console.error(`Błąd przetwarzania oferty Asari ID: ${asariListingInfo.id}:`, errorForSingleListing.message);
        errorCount++;
      }
    }

    console.log('Synchronizacja zakończona.');
    console.log(`Podsumowanie: Stworzono: ${createdCount}, Zaktualizowano: ${updatedCount}, Pominięto: ${skippedCount}, Zarchiwizowano: ${archivedCount}, Błędy: ${errorCount}`);
    
    return NextResponse.json({
      message: 'Synchronizacja zakończona.',
      totalAsariOffers: allAsariListingsInfo.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      archived: archivedCount,
      errors: errorCount,
    });

  } catch (error: any) {
    console.error('Krytyczny błąd podczas synchronizacji:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Błąd podczas synchronizacji', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('Rozłączono Prisma Client.');
  }
}