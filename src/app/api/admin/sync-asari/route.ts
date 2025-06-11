// src/app/api/admin/sync-asari/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // Importuj też typ ListingImage, jeśli potrzebujesz
import { fetchExportedListingIds, fetchListingDetails } from '@/services/asariApi';
import { AsariListingDetail } from '@/services/asariApi.types';

const prisma = new PrismaClient();

// Funkcja pomocnicza do opóźnienia
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funkcja pomocnicza do mapowania danych z Asari na model Prisma Listing
// To jest kluczowa funkcja, którą będziemy teraz budować!
function mapAsariDetailToPrismaListing(
  asariDetail: AsariListingDetail,
  currentTimestamp: Date // Do ustawienia lastUpdatedAsari, jeśli nie ma go w asariDetail
): any { // Zwróci obiekt gotowy do Prisma upsert, typ może być bardziej szczegółowy
  
  // Konwersja dat stringowych z Asari na obiekty Date dla Prisma
  // Użyj biblioteki jak date-fns dla bardziej niezawodnego parsowania, jeśli to konieczne
  const parseAsariDate = (dateString?: string | null): Date | null => {
    if (!dateString) return null;
    // Format "YYYY-MM-DD HH:MM:SS" jest generalnie dobrze parsowany przez new Date()
    // ale bądź ostrożny ze strefami czasowymi. Asari prawdopodobnie używa czasu polskiego.
    // Jeśli wynikowe daty są niepoprawne, trzeba będzie użyć date-fns/parse.
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const prismaListingData: any = { // Użyj 'any' na razie, potem można stworzyć typ
    // --- Kluczowe identyfikatory ---
    asariId: asariDetail.id,
    // `lastUpdatedAsari` powinno być ustawione na podstawie `asariDetail.lastUpdated`
    // lub `asariDetail.actualisationDate` jeśli to jest bardziej odpowiednie.
    // W `exportedListingIdList` mamy `lastUpdated`. W `listingDetail` mamy `actualisationDate` i `lastUpdated`.
    // Wybierzmy `asariDetail.lastUpdated` jako główne źródło dla naszej logiki porównawczej.
    lastUpdatedAsari: parseAsariDate(asariDetail.lastUpdated) || currentTimestamp,

    // --- Podstawowe informacje ---
    title: asariDetail.headerAdvertisement, // Użyj headerAdvertisement jako głównego tytułu
    description: asariDetail.description,
    englishDescription: asariDetail.englishDescription,
    internalComment: asariDetail.internal_comment, // Mapowanie snake_case na camelCase
    exportId: asariDetail.export_id,
    statusId: typeof asariDetail.status === 'string' ? undefined : asariDetail.status_id, // Jeśli status to string, status_id może być zbędne
                                                                                       // lub mapuj status string na ID jeśli masz taki słownik

    // --- Cena ---
    price: asariDetail.price?.amount,
    // priceCurrency: asariDetail.price?.currency, // W schemacie Prisma mamy priceCurrencyId
    // priceCurrencyId: asariDetail.price_currency_id, // Jeśli masz to pole w AsariListingDetail
    pricePerM2: asariDetail.priceM2?.amount,

    // --- Lokalizacja (spłaszczone z obiektów `location` i `street`) ---
    locationCity: asariDetail.location?.locality,
    locationDistrict: asariDetail.location?.quarter,
    locationStreet: asariDetail.street?.name,
    // locationStreetNumber: asariDetail.location?.street_no, // W JSON street_no było w obiekcie location
    // locationFlatNumber: asariDetail.location?.flat_no,     // -||-
    locationPostalCode: asariDetail.location?.address?.postalCode, // Jeśli masz adres w location
    // locationCountryId: asariDetail.country?.id, // Jest asariDetail.country.id
    latitude: asariDetail.geoLat,
    longitude: asariDetail.geoLng,
    locationVoivodeship: asariDetail.location?.province, // province z location
    // locationCounty: asariDetail.location?.county, // Brak w JSON
    // locationCommunity: asariDetail.location?.community, // Brak w JSON

    // --- Szczegóły nieruchomości ---
    // Tutaj musisz zdecydować, które pola z głównego poziomu AsariListingDetail
    // oraz z potencjalnego zagnieżdżonego obiektu `property` mapujesz na swój model Prisma.
    area: asariDetail.totalArea || asariDetail.lotArea, // Użyj lotArea dla działek, totalArea dla innych
    roomsCount: asariDetail.noOfRooms,
    floor: asariDetail.floorNo,
    floorCount: asariDetail.noOfFloors,
    // buildingMaterialId: asariDetail.property?.building_material_id, // Jeśli masz obiekt property
    // windowTypeId: asariDetail.property?.window_type_id,
    // heatingTypeId: asariDetail.property?.heating_type_id,

    // --- Informacje o transakcji ---
    // transactionTypeId: asariDetail.transaction_type_id,
    // marketTypeId: asariDetail.market_type_id, // Jest mortgageMarket jako string
    offerType: asariDetail.section, // Np. LotSale, ApartmentSale - mapuj na swoje pole offerType

    // --- Agent (spłaszczone) ---
    agentAsariId: asariDetail.agent?.id,
    agentName: `${asariDetail.agent?.firstName || ''} ${asariDetail.agent?.lastName || ''}`.trim(),
    // agentFirstName: asariDetail.agent?.firstName, // Jeśli masz osobne pola w Prisma
    // agentLastName: asariDetail.agent?.lastName,
    agentPhone: asariDetail.agent?.phoneNumber,
    agentEmail: asariDetail.agent?.email,
    agentSkypeUser: asariDetail.agent?.skypeUser,
    agentImageAsariId: asariDetail.agent?.imageId,

    // --- Hierarchia (uproszczone) ---
    parentListingAsariId: typeof asariDetail.parentListing?.listingId === 'string' 
                            ? asariDetail.parentListing.listingId 
                            : (typeof asariDetail.parentListingId === 'number' // Sprawdź, czy to nie powinno być string
                                ? String(asariDetail.parentListingId) 
                                : null),


    // --- Daty systemowe z Asari ---
    createdAtSystem: parseAsariDate(asariDetail.dateCreated),
    updatedAtSystem: parseAsariDate(asariDetail.actualisationDate), // lub asariDetail.lastUpdated

    // --- Pole JSON na resztę ---
    // Tutaj możesz wrzucić całe obiekty lub wybrane pola, których nie mapujesz jawnie
    additionalDetailsJson: { 
      // Przykładowo:
      contractType: asariDetail.contractType,
      listingIdString: asariDetail.listingId, // Ten stringowy numer oferty
      statusString: asariDetail.status,
      mortgageMarket: asariDetail.mortgageMarket,
      lotForm: asariDetail.lotForm,
      lotShape: asariDetail.lotShape,
      lotType: asariDetail.lotType,
      // Możesz tu dodać całe obiekty, jeśli chcesz je mieć w JSON
      // asariPropertyObject: asariDetail.property, 
      // asariLocationObject: asariDetail.location,
      // asariStreetObject: asariDetail.street,
      availableNeighborhoodList: asariDetail.availableNeighborhoodList,
      communicationList: asariDetail.communicationList,
      sewerageTypeList: asariDetail.sewerageTypeList,
      waterTypeList: asariDetail.waterTypeList,
      zoningPlan: asariDetail.zoningPlan,
      // ... i wiele innych opcjonalnych pól ...
      buildingType: asariDetail.buildingType, // Z JSON dla mieszkania
      material: asariDetail.material, // Z JSON dla mieszkania
    },
  };

  // Usuń klucze z obiektu, które mają wartość undefined, aby Prisma nie próbowała ich ustawiać na null, jeśli nie są opcjonalne w schemacie
  Object.keys(prismaListingData).forEach(key => {
    if (prismaListingData[key] === undefined) {
      delete prismaListingData[key];
    }
    if (key === 'additionalDetailsJson' && typeof prismaListingData[key] === 'object' && Object.keys(prismaListingData[key]).length === 0) {
      delete prismaListingData[key]; // Usuń pusty obiekt JSON
    }
  });
  
  return prismaListingData;
}


export async function POST() {
  console.log('Rozpoczynanie synchronizacji ofert z Asari...');
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const listingsProcessed: number[] = [];

  try {
    const asariIdsResponse = await fetchExportedListingIds();
    if (!asariIdsResponse.success || !asariIdsResponse.data) {
      throw new Error('Nie udało się pobrać listy ID ofert z Asari lub odpowiedź jest niepoprawna.');
    }
    const allAsariListingsInfo = asariIdsResponse.data;
    console.log(`Pobrano ${allAsariListingsInfo.length} informacji o ofertach z Asari. Przetwarzanie...`);

    const listingsToProcess = allAsariListingsInfo;

    for (const asariListingInfo of listingsToProcess) {
      try {
        listingsProcessed.push(asariListingInfo.id);
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
        });

        const asariLastUpdatedDate = new Date(asariListingInfo.lastUpdated); // Parsujemy string z listy ID

        if (existingListing && existingListing.lastUpdatedAsari && asariLastUpdatedDate <= existingListing.lastUpdatedAsari) {
          console.log(`Oferta Asari ID: ${asariListingInfo.id} jest aktualna, pomijanie.`);
          skippedCount++;
          continue;
        }

        console.log(`Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id}...`);
        // Wprowadź opóźnienie PRZED każdym żądaniem o szczegóły
        await delay(3000); // 3 sekundy opóźnienia (dostosuj do limitu 25/min)

        const detailsResponse = await fetchListingDetails(asariListingInfo.id);
        if (!detailsResponse.success || !detailsResponse.data) {
          console.error(`Nie udało się pobrać szczegółów dla oferty Asari ID: ${asariListingInfo.id} lub niepoprawna odpowiedź API.`);
          errorCount++;
          continue;
        }
        const listingDataFromAsari = detailsResponse.data;

        // Mapowanie danych
        const prismaReadyData = mapAsariDetailToPrismaListing(listingDataFromAsari, asariLastUpdatedDate);

        // Przygotowanie danych dla zdjęć
        const imagesToCreate = 
          listingDataFromAsari.images?.map(img => ({
            asariId: img.id,
            urlThumbnail: `https://img.asariweb.pl/thumbnail/${img.id}`,
            urlNormal: `https://img.asariweb.pl/normal/${img.id}`,
            description: img.description,
            order: undefined, // W JSON nie było 'order', jeśli jest, dodaj: img.order
          })) || [];

        // Operacja Upsert
        await prisma.listing.upsert({
          where: { asariId: listingDataFromAsari.id },
          update: {
            ...prismaReadyData,
            images: { // Obsługa relacji dla zdjęć
              deleteMany: {}, // Usuń wszystkie stare zdjęcia powiązane z tą ofertą
              create: imagesToCreate, // Stwórz nowe
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
          console.log(`Zaktualizowano ofertę Asari ID: ${listingDataFromAsari.id}`);
        } else {
          createdCount++;
          console.log(`Stworzono nową ofertę Asari ID: ${listingDataFromAsari.id}`);
        }

      } catch (errorForSingleListing: any) {
        console.error(`Błąd podczas przetwarzania oferty Asari ID: ${asariListingInfo.id}:`, errorForSingleListing.message);
        errorCount++;
      }
    }

    console.log('Synchronizacja zakończona.');
    console.log(`Przetworzono ofert (ID): ${listingsProcessed.join(', ')}`);
    console.log(`Stworzono: ${createdCount}, Zaktualizowano: ${updatedCount}, Pominięto: ${skippedCount}, Błędy: ${errorCount}`);
    
    return NextResponse.json({
      message: 'Synchronizacja zakończona.',
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      totalAsariOffers: allAsariListingsInfo.length,
      processedIds: listingsProcessed,
    });

  } catch (error: any) {
    console.error('Krytyczny błąd podczas synchronizacji:', error);
    return NextResponse.json(
      { message: 'Błąd podczas synchronizacji', error: error.message, stack: error.stack },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('Rozłączono Prisma Client.');
  }
}