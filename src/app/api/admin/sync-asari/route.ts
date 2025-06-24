import { NextResponse } from 'next/server';
import { fetchExportedListingIds, fetchListingDetails } from '@/services/asariApi';
import { AsariListingDetail } from '@/services/asariApi.types';
import { prisma } from '@/services/prisma';

const ASARI_IMAGE_BASE_URL_THUMBNAIL = "https://img.asariweb.pl/thumbnail/";
const ASARI_IMAGE_BASE_URL_NORMAL = "https://img.asariweb.pl/normal/";

// Funkcja pomocnicza do opóźnienia
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funkcja pomocnicza do mapowania danych z Asari na model Prisma Listing
function mapAsariDetailToPrismaListing(
  asariDetail: AsariListingDetail,
  currentTimestamp: Date // Do ustawienia lastUpdatedAsari, jeśli nie ma go w asariDetail
): any {
  
  const parseAsariDate = (dateString?: string | null): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const prismaListingData: any = {
    asariId: asariDetail.id,
    lastUpdatedAsari: parseAsariDate(asariDetail.lastUpdated) || currentTimestamp,
    title: asariDetail.headerAdvertisement,
    description: asariDetail.description,
    englishDescription: asariDetail.englishDescription,
    internalComment: asariDetail.internal_comment,
    exportId: asariDetail.export_id,
    statusId: typeof asariDetail.status === 'string' ? undefined : asariDetail.status_id,
    price: asariDetail.price?.amount,
    pricePerM2: asariDetail.priceM2?.amount,
    locationCity: asariDetail.location?.locality,
    locationDistrict: asariDetail.location?.quarter,
    locationStreet: asariDetail.street?.name,
    locationPostalCode: asariDetail.location?.address?.postalCode,
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
      statusString: asariDetail.status,
      mortgageMarket: asariDetail.mortgageMarket,
      lotForm: asariDetail.lotForm,
      lotShape: asariDetail.lotShape,
      lotType: asariDetail.lotType,
      availableNeighborhoodList: asariDetail.availableNeighborhoodList,
      communicationList: asariDetail.communicationList,
      sewerageTypeList: asariDetail.sewerageTypeList,
      waterTypeList: asariDetail.waterTypeList,
      zoningPlan: asariDetail.zoningPlan,
      buildingType: asariDetail.buildingType,
      material: asariDetail.material,
      // Dodaj tu inne pola z AsariListingDetail, które chcesz przechować w JSON
      // np. asariDetail.country?.id, asariDetail.street?.id itp.
      // Upewnij się, że mapujesz również pola, które są w Twoim schemacie Prisma
      // a nie zostały jawnie zmapowane powyżej, jeśli mają pochodzić z ASARI
      locationStreetNumber: asariDetail.location?.street_no, // Przykład, jeśli istnieje w AsariListingDetail
      locationFlatNumber: asariDetail.location?.flat_no,     // Przykład
      // buildingMaterialId: asariDetail.property?.building_material_id, // Przykład
      // windowTypeId: asariDetail.property?.window_type_id,       // Przykład
      // heatingTypeId: asariDetail.property?.heating_type_id,     // Przykład
      // transactionTypeId: asariDetail.transaction_type_id,     // Przykład
      // marketTypeId: asariDetail.market_type_id,             // Przykład
    },
  };

  Object.keys(prismaListingData).forEach(key => {
    if (prismaListingData[key] === undefined) {
      delete prismaListingData[key];
    }
    if (key === 'additionalDetailsJson' && typeof prismaListingData[key] === 'object' && prismaListingData[key] !== null && Object.keys(prismaListingData[key]).length === 0) {
      delete prismaListingData[key]; 
    }
  });
  
  return prismaListingData;
}


export async function POST(request: Request) {
  const secretFromHeader = request.headers.get('X-Admin-Secret');

  if (secretFromHeader !== process.env.DUMMY_LOCAL_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  console.log('Rozpoczynanie synchronizacji ofert z Asari...');
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0; 
  let deletedCount = 0;
  const listingsProcessedIds: number[] = [];

  try {
    // 1. Pobierz wszystkie ID ofert (i daty ich ostatniej modyfikacji) z API ASARI
    const asariIdsResponse = await fetchExportedListingIds();
    if (!asariIdsResponse.success || !asariIdsResponse.data) {
      throw new Error('Nie udało się pobrać listy ID ofert z Asari lub odpowiedź jest niepoprawna.');
    }
    const allAsariListingsInfo = asariIdsResponse.data;
    console.log(`Pobrano ${allAsariListingsInfo.length} informacji o ofertach z Asari.`);

    const activeAsariIdsSet = new Set(allAsariListingsInfo.map(info => info.id));

    // 2. Pobierz wszystkie asariId z lokalnej bazy danych
    const localListings = await prisma.listing.findMany({
      select: { asariId: true },
    });
    const localAsariIds = localListings.map(l => l.asariId);

    // 3. Zidentyfikuj oferty do usunięcia (te, które są w lokalnej bazie, a nie ma ich już w ASARI)
    const idsToDelete = localAsariIds.filter(id => !activeAsariIdsSet.has(id));

    // 4. Usuń zidentyfikowane oferty z lokalnej bazy danych
    if (idsToDelete.length > 0) {
      console.log(`Znaleziono ${idsToDelete.length} ofert do usunięcia: ${idsToDelete.join(', ')}`);
      const deleteResult = await prisma.listing.deleteMany({
        where: {
          asariId: {
            in: idsToDelete,
          },
        },
      });
      deletedCount = deleteResult.count;
      console.log(`Usunięto ${deletedCount} ofert z lokalnej bazy danych.`);
    } else {
      console.log('Nie znaleziono ofert do usunięcia z lokalnej bazy danych.');
    }

    // 5. Przetwórz oferty (dodaj nowe, zaktualizuj istniejące)
    for (const asariListingInfo of allAsariListingsInfo) {
      try {
        listingsProcessedIds.push(asariListingInfo.id);
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
          select: { lastUpdatedAsari: true } // Wystarczy pobrać tylko to pole do porównania
        });

        const asariLastUpdatedDate = new Date(asariListingInfo.lastUpdated);

        if (existingListing && existingListing.lastUpdatedAsari && asariLastUpdatedDate <= existingListing.lastUpdatedAsari) {
          // console.log(`Oferta Asari ID: ${asariListingInfo.id} jest aktualna, pomijanie.`);
          skippedCount++;
          continue;
        }

        console.log(`Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id} (Ostatnia modyfikacja ASARI: ${asariListingInfo.lastUpdated}).`);
        await delay(3000); // Opóźnienie przed żądaniem

        const detailsResponse = await fetchListingDetails(asariListingInfo.id);
        if (!detailsResponse.success || !detailsResponse.data) {
          console.error(`Nie udało się pobrać szczegółów dla oferty Asari ID: ${asariListingInfo.id} lub niepoprawna odpowiedź API. Odpowiedź: ${JSON.stringify(detailsResponse)}`);
          errorCount++;
          continue;
        }
        const listingDataFromAsari: AsariListingDetail = detailsResponse.data;

        // Użyj `listingDataFromAsari.lastUpdated` jeśli istnieje i jest bardziej precyzyjne,
        // w przeciwnym razie użyj `asariListingInfo.lastUpdated` z listy ID.
        // `mapAsariDetailToPrismaListing` już preferuje `listingDataFromAsari.lastUpdated`
        const effectiveLastUpdated = listingDataFromAsari.lastUpdated ? new Date(listingDataFromAsari.lastUpdated) : asariLastUpdatedDate;

        const prismaReadyData = mapAsariDetailToPrismaListing(listingDataFromAsari, effectiveLastUpdated);

        const imagesToCreate = 
          listingDataFromAsari.images?.map(img => ({
            asariId: img.id,
            urlThumbnail: `${ASARI_IMAGE_BASE_URL_THUMBNAIL}${img.id}`,
            urlNormal: `${ASARI_IMAGE_BASE_URL_NORMAL}${img.id}`,
            description: img.description,
            order: img.order, // Dodaj img.order jeśli istnieje w Twoim typie AsariImage
          })) || [];

        await prisma.listing.upsert({
          where: { asariId: listingDataFromAsari.id },
          update: {
            ...prismaReadyData,
            images: {
              deleteMany: {}, 
              create: imagesToCreate,
            },
          },
          create: {
            ...prismaReadyData,
            images: {
              create: imagesToCreate,
            },
          },
        });

        if (existingListing) {
          updatedCount++;
          // console.log(`Zaktualizowano ofertę Asari ID: ${listingDataFromAsari.id}`);
        } else {
          createdCount++;
          // console.log(`Stworzono nową ofertę Asari ID: ${listingDataFromAsari.id}`);
        }

      } catch (errorForSingleListing: any) {
        console.error(`Błąd podczas przetwarzania oferty Asari ID: ${asariListingInfo.id}:`, errorForSingleListing.message, errorForSingleListing.stack);
        errorCount++;
      }
    }

    console.log('Synchronizacja zakończona.');
    console.log(`Podsumowanie: Stworzono: ${createdCount}, Zaktualizowano: ${updatedCount}, Pominięto: ${skippedCount}, Usunięto: ${deletedCount}, Błędy: ${errorCount}`);
    // console.log(`Przetworzono ID ofert: ${listingsProcessedIds.join(', ')}`);
    
    return NextResponse.json({
      message: 'Synchronizacja zakończona.',
      totalAsariOffers: allAsariListingsInfo.length,
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      deleted: deletedCount, // Dodane
      errors: errorCount,
      // processedIds: listingsProcessedIds, // Możesz odkomentować, jeśli potrzebujesz tej listy w odpowiedzi
    });

  } catch (error: any) {
    console.error('Krytyczny błąd podczas synchronizacji:', error.message, error.stack);
    return NextResponse.json(
      { message: 'Błąd podczas synchronizacji', error: error.message, stack: error.stack },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('Rozłączono Prisma Client.');
  }
}