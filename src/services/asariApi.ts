import { ExportedListingIdListApiResponse, ListingDetailsApiResponse } from "./asariApi.types";

const ASARI_API_BASE_URL = process.env.ASARI_API_BASE_URL;
const ASARI_USER_ID = process.env.ASARI_USER_ID;
const ASARI_TOKEN = process.env.ASARI_TOKEN;

if (!ASARI_API_BASE_URL || !ASARI_USER_ID || !ASARI_TOKEN) {
  throw new Error("ASARI API environment variables are not set!");
}

const SITE_AUTH_HEADER = `${ASARI_USER_ID}:${ASARI_TOKEN}`;

// Ogólna funkcja pomocnicza do wysyłania żądań POST do Asari
// Możemy ją później rozbudować o lepszą obsługę błędów i typowanie
async function postToAsari<TResponse>(
  endpoint: string, 
  bodyData?: Record<string, string | number | undefined>
): Promise<TResponse> {
  const url = `${ASARI_API_BASE_URL}${endpoint}`;
  
  const formData = new FormData();
  if (bodyData) {
    for (const key in bodyData) {
      if (bodyData[key] !== undefined) {
        formData.append(key, String(bodyData[key]));
      }
    }
  }

  console.log(`Sending POST request to ASARI: ${url} with body:`, bodyData);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "SiteAuth": SITE_AUTH_HEADER,
      // Content-Type jest automatycznie ustawiany przez fetch, gdy używasz FormData
    },
    body: formData, // Nawet jeśli formData jest puste, dla endpointów tego wymagających
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ASARI API Error (${response.status}) for ${endpoint}: ${errorText}`);
    // Możesz rzucić bardziej specyficzny błąd lub zwrócić obiekt błędu
    throw new Error(`ASARI API request failed for ${endpoint}: ${response.status} - ${errorText}`);
  }

  // Sprawdźmy, czy odpowiedź nie jest pusta, zanim spróbujemy ją sparsować jako JSON
  const responseText = await response.text();
  if (!responseText) {
      console.warn(`ASARI API Warning: Empty response for ${endpoint}`);
      // Zwróć pusty obiekt lub odpowiedni typ, jeśli to oczekiwane dla niektórych endpointów
      // Dla bezpieczeństwa, rzućmy błąd, jeśli oczekujemy JSONa
      throw new Error(`ASARI API Error: Empty response for ${endpoint} when JSON was expected.`);
  }

  try {
    return JSON.parse(responseText) as TResponse;
  } catch (e) {
    console.error(`ASARI API Error: Failed to parse JSON response for ${endpoint}. Response text: ${responseText}`, e);
    throw new Error(`ASARI API Error: Failed to parse JSON response for ${endpoint}.`);
  }
}


export async function fetchExportedListingIds(
  closedDays?: number,
  blockedDays?: number
): Promise<ExportedListingIdListApiResponse> {
  const bodyParams: Record<string, string | number | undefined> = {};
  if (closedDays !== undefined) {
    bodyParams.closedDays = closedDays;
  }
  if (blockedDays !== undefined) {
    bodyParams.blockedDays = blockedDays;
  }
  // Zakładamy, że API oczekuje tych parametrów w ciele żądania POST jako multipart/form-data
  return postToAsari<ExportedListingIdListApiResponse>("/exportedListingIdList", bodyParams);
}

export async function fetchListingDetails(listingId: number): Promise<ListingDetailsApiResponse> {
  const endpointWithQueryParam = `/listing?id=${listingId}`;
  
  return postToAsari<ListingDetailsApiResponse>(endpointWithQueryParam, {});
}


// TODO: Zaimplementuj fetchI18nMessages(locale: string)