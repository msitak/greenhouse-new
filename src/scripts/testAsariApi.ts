// scripts/testAsariApi.ts
// Aby to uruchomić, możesz potrzebować ts-node: npm install -D ts-node
// Uruchomienie: npx ts-node --require dotenv/config scripts/testAsariApi.ts
// (dotenv/config wczyta zmienne z .env)

import { ExportedListingIdListResponse, fetchExportedListingIds } from '@/services/asariApi';

async function testApi() {
  console.log("Testing fetchExportedListingIds...");
  try {
    const listingsResponse = await fetchExportedListingIds(); // Bez parametrów na początek
    console.log("Fetched listing IDs:", listingsResponse.data.slice(0, 5)); // Pokaż pierwsze 5
    console.log("Total results (if available in response):", (listingsResponse as ExportedListingIdListResponse).totalCount); // Jeśli jest pole total
    console.log(`Successfully fetched ${listingsResponse.data.length} listing IDs.`);

    // Możesz też przetestować z parametrami:
    // const listingsWithParams = await fetchExportedListingIds(5, 10);
    // console.log("Fetched listing IDs (with params):", listingsWithParams.results.length);

  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testApi();