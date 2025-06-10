const ASARI_API_BASE_URL = process.env.ASARI_API_BASE_URL;
const ASARI_USER_ID = process.env.ASARI_USER_ID;
const ASARI_TOKEN = process.env.ASARI_TOKEN;

if (!ASARI_API_BASE_URL || !ASARI_USER_ID || !ASARI_TOKEN) {
  throw new Error("ASARI API environment variables are not set!");
}

const SITE_AUTH_HEADER = `${ASARI_USER_ID}:${ASARI_TOKEN}`;

export interface AsariListingIdEntry {
  id: number;
  lastUpdated: string;
}

export interface ExportedListingIdListResponse {
  data: AsariListingIdEntry[];
  success: boolean;
  totalCount: number;
}

export interface AsariListingAgent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string; // W dokumentacji jest 'phoneNumber', ale API może zwracać 'phone_1' etc. Sprawdź!
    skypeUser?: string;
    imageId?: number;
  }
  
  export interface AsariParentListingInfo {
      id: number;       // ID wpisu w tabeli powiązań (nie ID oferty)
      listingId: string; // Identyfikator oferty nadrzędnej (prawdopodobnie asariId)
      name: string;
  }
  
  export interface AsariNestedListingInfo {
      id: number;       // ID wpisu w tabeli powiązań
      listingId: number;  // ID zagnieżdżonej oferty (prawdopodobnie asariId)
  }
  
  
  export interface AsariListingDetail {
    id: number; // asariId
    export_id?: string;
    status_id?: number;
    title?: string;
    description?: string;
    englishDescription?: string;
    internal_comment?: string; // Używaj snake_case jeśli tak zwraca API, potem mapuj na camelCase
    
    price?: number;
    price_currency_id?: number;
    price_m2?: number;
  
    location?: { // Zagnieżdżony obiekt location
      city?: string;
      district?: string;
      street?: string;
      street_no?: string; // street_no zamiast streetNumber
      flat_no?: string;
      postal_code?: string;
      country_id?: number;
      coords_lat?: number;
      coords_lng?: number;
      voivodeship?: string;
      county?: string;
      community?: string;
      // ... inne pola lokalizacji
    };

    property?: { // Zagnieżdżony obiekt property
      type_id?: number;
      area_total_m2?: number; // Lub inne pole area, np. area_usable_m2
      rooms_count?: number;
      floor?: number;
      floor_count?: number;
      build_year?: number;
      // ... i wiele innych pól z dokumentacji 'property', np. 'features' jako tablica
    };

    transaction_type_id?: number;
    market_type_id?: number;
    agent?: AsariListingAgent; // Użyj zdefiniowanego interfejsu
    images?: Array<{ id: number; description?: string; isScheme?: boolean;}>;
    parentListing?: AsariParentListingInfo;
    nestedListings?: AsariNestedListingInfo[];
  
    // ... inne pola zgodne z odpowiedzią API Asari dla /listing ...
    // np. `features` (może być tablicą stringów lub obiektów), `additional_areas`, `media`
    // Jeśli te struktury są złożone, mogą trafić do pola JSON w Prisma
  }
  
  interface ListingDetailsApiResponse {
    success?: boolean;
    data?: AsariListingDetail; 
  }

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
): Promise<ExportedListingIdListResponse> {
  const bodyParams: Record<string, string | number | undefined> = {};
  if (closedDays !== undefined) {
    bodyParams.closedDays = closedDays;
  }
  if (blockedDays !== undefined) {
    bodyParams.blockedDays = blockedDays;
  }
  // Zakładamy, że API oczekuje tych parametrów w ciele żądania POST jako multipart/form-data
  return postToAsari<ExportedListingIdListResponse>("/exportedListingIdList", bodyParams);
}

export async function fetchListingDetails(listingId: number): Promise<ListingDetailsApiResponse> {
  // Parametr 'id' zgodnie z dokumentacją Asari dla /listing jest w URL query string
  const endpointWithQueryParam = `/listing?id=${listingId}`;
  
  // Funkcja postToAsari obecnie przyjmuje parametry `bodyData` dla FormData.
  // Dla tego endpointu /listing?id=X, ciało FormData będzie puste,
  // ponieważ parametr 'id' jest w URL.
  // Serwer Asari musi akceptować POST z Content-Type: multipart/form-data i pustym ciałem,
  // jeśli SiteAuth i Content-Type są wymagane dla wszystkich POSTów.
  return postToAsari<ListingDetailsApiResponse>(endpointWithQueryParam, {}); // Przekaż pusty obiekt bodyData
}


// TODO: Zaimplementuj fetchI18nMessages(locale: string)