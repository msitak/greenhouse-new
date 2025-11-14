import {
  ExportedListingIdListApiResponse,
  ListingDetailsApiResponse,
  AsariUserListResponse,
} from './asariApi.types';

function getAsariEnv(): {
  baseUrl: string | undefined;
  userId: string | undefined;
  token: string | undefined;
} {
  return {
    baseUrl: process.env.ASARI_API_BASE_URL,
    userId: process.env.ASARI_USER_ID,
    token: process.env.ASARI_TOKEN,
  };
}

// Ogólna funkcja pomocnicza do wysyłania żądań POST do Asari
// Możemy ją później rozbudować o lepszą obsługę błędów i typowanie
async function postToAsari<TResponse>(
  endpoint: string,
  bodyData?: Record<string, string | number | undefined>
): Promise<TResponse> {
  const { baseUrl, userId, token } = getAsariEnv();
  if (!baseUrl || !userId || !token) {
    throw new Error('ASARI API environment variables are not set!');
  }

  const url = `${baseUrl}${endpoint}`;

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
    method: 'POST',
    headers: {
      SiteAuth: `${userId}:${token}`,
      // Content-Type jest automatycznie ustawiany przez fetch, gdy używasz FormData
    },
    body: formData, // Nawet jeśli formData jest puste, dla endpointów tego wymagających
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `ASARI API Error (${response.status}) for ${endpoint}: ${errorText}`
    );
    // Możesz rzucić bardziej specyficzny błąd lub zwrócić obiekt błędu
    throw new Error(
      `ASARI API request failed for ${endpoint}: ${response.status} - ${errorText}`
    );
  }

  // Sprawdźmy, czy odpowiedź nie jest pusta, zanim spróbujemy ją sparsować jako JSON
  const responseText = await response.text();
  if (!responseText) {
    console.warn(`ASARI API Warning: Empty response for ${endpoint}`);
    // Zwróć pusty obiekt lub odpowiedni typ, jeśli to oczekiwane dla niektórych endpointów
    // Dla bezpieczeństwa, rzućmy błąd, jeśli oczekujemy JSONa
    throw new Error(
      `ASARI API Error: Empty response for ${endpoint} when JSON was expected.`
    );
  }

  try {
    return JSON.parse(responseText) as TResponse;
  } catch (e) {
    console.error(
      `ASARI API Error: Failed to parse JSON response for ${endpoint}. Response text: ${responseText}`,
      e
    );
    throw new Error(
      `ASARI API Error: Failed to parse JSON response for ${endpoint}.`
    );
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
  return postToAsari<ExportedListingIdListApiResponse>(
    '/exportedListingIdList',
    bodyParams
  );
}

export async function fetchListingDetails(
  listingId: number
): Promise<ListingDetailsApiResponse> {
  const endpointWithQueryParam = `/listing?id=${listingId}`;

  return postToAsari<ListingDetailsApiResponse>(endpointWithQueryParam, {});
}

/**
 * Pobiera listę wszystkich użytkowników/agentów z Asari
 * Ten endpoint nie wymaga body, tylko header SiteAuth
 */
export async function fetchUserList(): Promise<AsariUserListResponse> {
  const { baseUrl, userId, token } = getAsariEnv();
  if (!baseUrl || !userId || !token) {
    throw new Error('ASARI API environment variables are not set!');
  }

  const url = `${baseUrl}/user/list`;
  console.log(`Fetching user list from ASARI: ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      SiteAuth: `${userId}:${token}`,
      'Content-Type': 'application/json',
    },
    // Puste body - endpoint nie wymaga parametrów
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `ASARI API Error (${response.status}) for /site/user/list: ${errorText}`
    );
    throw new Error(
      `ASARI API request failed for /site/user/list: ${response.status}`
    );
  }

  const data = await response.json();
  return data as AsariUserListResponse;
}

// TODO: Zaimplementuj fetchI18nMessages(locale: string)
