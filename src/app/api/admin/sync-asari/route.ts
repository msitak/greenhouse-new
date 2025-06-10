// src/app/api/admin/sync-asari/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  fetchExportedListingIds,
  // fetchListingDetails, // Za chwilę go zaimplementujemy i odkomentujemy
  // AsariListingDetail, // Interfejs dla szczegółów oferty
} from '../../../../services/asariApi'; // Dostosuj ścieżkę do swojego asariApi.ts

const prisma = new PrismaClient();

// Funkcja pomocnicza do opóźnienia
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST() { // Użyjemy POST, aby np. zabezpieczyć go tokenem w przyszłości
  console.log('Rozpoczynanie synchronizacji ofert z Asari...');
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 1. Pobierz wszystkie ID ofert i daty ostatniej aktualizacji z Asari
    const asariIdsResponse = await fetchExportedListingIds();
    if (!asariIdsResponse.success || !asariIdsResponse.data) {
      throw new Error('Nie udało się pobrać listy ID ofert z Asari lub odpowiedź jest niepoprawna.');
    }
    const asariListingsInfo = asariIdsResponse.data;
    console.log(`Pobrano ${asariListingsInfo.length} informacji o ofertach z Asari.`);

    for (const asariListingInfo of asariListingsInfo) {
      try {
        // 2. Sprawdź, czy oferta istnieje w lokalnej bazie i czy wymaga aktualizacji
        const existingListing = await prisma.listing.findUnique({
          where: { asariId: asariListingInfo.id },
        });

        // Konwersja stringa lastUpdated z Asari na obiekt Date do porównania
        // Zakładamy format "YYYY-MM-DD HH:MM:SS"
        // Ważne: JavaScript Date może inaczej interpretować daty bez strefy czasowej.
        // Jeśli Asari zwraca czas UTC, to dobrze. Jeśli lokalny, trzeba być ostrożnym.
        // Dla uproszczenia na razie zakładamy, że proste porównanie wystarczy,
        // ale docelowo warto to uściślić i być może użyć biblioteki jak date-fns lub moment.js
        // dla bardziej niezawodnego parsowania i porównywania.
        const asariLastUpdatedDate = new Date(asariListingInfo.lastUpdated);
        
        // Jeśli używamy typu DateTime dla lastUpdatedAsari w Prisma:
        if (existingListing && existingListing.lastUpdatedAsari && asariLastUpdatedDate <= existingListing.lastUpdatedAsari) {
          console.log(`Oferta Asari ID: ${asariListingInfo.id} jest aktualna, pomijanie.`);
          skippedCount++;
          continue; // Przejdź do następnej oferty
        }

        // 3. Jeśli nowa lub wymaga aktualizacji, pobierz pełne szczegóły oferty
        console.log(`Pobieranie szczegółów dla oferty Asari ID: ${asariListingInfo.id}...`);
        
        // const asariDetailResponse = await fetchListingDetails(asariListingInfo.id); // OD<x_bin_472>IMPLEMENTOWAĆ
        // if (!asariDetailResponse || !asariDetailResponse.results) { // DOSTOSOWAĆ DO FAKTYCZNEJ ODPOWIEDZI
        //   console.error(`Nie udało się pobrać szczegółów dla oferty Asari ID: ${asariListingInfo.id} lub niepoprawna odpowiedź.`);
        //   errorCount++;
        //   continue;
        // }
        // const listingDataFromAsari = asariDetailResponse.results;

        // MOCK: Na razie, zanim zaimplementujemy fetchListingDetails, użyjemy danych z listy ID
        // TODO: Zastąp to faktycznym pobieraniem i mapowaniem szczegółów
        const listingDataToSave = {
          asariId: asariListingInfo.id,
          lastUpdatedAsari: asariLastUpdatedDate, // Przechowujemy jako obiekt Date
          title: `Mock Title for ${asariListingInfo.id}`, // TODO: Zastąp prawdziwymi danymi
          description: `Mock description for listing ${asariListingInfo.id}. Last updated: ${asariListingInfo.lastUpdated}`,
          price: Math.floor(Math.random() * 1000000) + 100000, // Przykładowa cena
          area: Math.floor(Math.random() * 100) + 30, // Przykładowa powierzchnia
          locationCity: "Mock City",
          // ... zmapuj inne pola z `listingDataFromAsari` na model Prisma `Listing`
          // np. agentAsariId, agentName, propertyTypeId etc.

          // TODO: Obsługa zdjęć (ListingImage)
          // Jeśli `listingDataFromAsari` zawiera listę zdjęć:
          // images: {
          //   // Użyj 'create' lub 'connectOrCreate' lub 'upsert' dla zagnieżdżonych zapisów zdjęć
          //   // To zależy od tego, jak chcesz zarządzać zdjęciami (czy usuwać stare i dodawać nowe, czy aktualizować istniejące)
          //   create: listingDataFromAsari.images?.map(img => ({
          //     asariId: img.id, // ID zdjęcia z Asari
          //     urlThumbnail: `https://img.asariweb.pl/thumbnail/${img.id}`,
          //     urlNormal: `https://img.asariweb.pl/normal/${img.id}`,
          //     description: img.description,
          //     order: img.order,
          //   })) || [],
          // },
        };

        // 4. Zapisz/zaktualizuj ofertę w bazie Prisma
        await prisma.listing.upsert({
          where: { asariId: asariListingInfo.id },
          update: listingDataToSave,
          create: listingDataToSave,
        });

        if (existingListing) {
          updatedCount++;
          console.log(`Zaktualizowano ofertę Asari ID: ${asariListingInfo.id}`);
        } else {
          createdCount++;
          console.log(`Stworzono nową ofertę Asari ID: ${asariListingInfo.id}`);
        }

        // 5. Implementuj opóźnienie, aby nie przekroczyć limitu API Asari
        // Opóźnienie po każdym pobraniu SZCZEGÓŁÓW oferty
        await delay(4000); // 4 sekundy (dostosuj wg potrzeb, ~2.4s to limit 25/min)

      } catch (errorForSingleListing) {
        console.error(`Błąd podczas przetwarzania oferty Asari ID: ${asariListingInfo.id}:`, errorForSingleListing);
        errorCount++;
        // Możesz chcieć kontynuować pętlę mimo błędu dla pojedynczej oferty
      }
    } // Koniec pętli for

    console.log('Synchronizacja zakończona.');
    console.log(`Stworzono: ${createdCount}, Zaktualizowano: ${updatedCount}, Pominięto: ${skippedCount}, Błędy: ${errorCount}`);
    
    return NextResponse.json({
      message: 'Synchronizacja zakończona.',
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      totalProcessed: asariListingsInfo.length,
    });

  } catch (error) {
    console.error('Krytyczny błąd podczas synchronizacji:', error);
    return NextResponse.json(
      { message: 'Błąd podczas synchronizacji', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}