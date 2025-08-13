import { NextRequest, NextResponse } from 'next/server';

const SILESIAN_RECT = {
  low: { latitude: 49.3, longitude: 18.0 },
  high: { latitude: 51.05, longitude: 20.1 },
};

export async function POST(req: NextRequest) {
  const {
    input,
    sessionToken,
    languageCode = 'pl',
    regionCodes = ['pl'],
  } = await req.json();

  if (!input || typeof input !== 'string') {
    return NextResponse.json({ suggestions: [] });
  }

  const payload = {
    input,
    sessionToken,
    languageCode,
    includedRegionCodes: regionCodes,
    includedPrimaryTypes: ['locality', 'sublocality', 'route'],
    // SOFT: tylko bias na Śląskie, brak hard restriction
    locationBias: { rectangle: SILESIAN_RECT },
  };

  const res = await fetch(
    'https://places.googleapis.com/v1/places:autocomplete',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask':
          'suggestions.placePrediction.placeId,' +
          'suggestions.placePrediction.text.text,' +
          'suggestions.placePrediction.types',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: 'PLACES_AUTOCOMPLETE_FAILED', detail: text },
      { status: res.status }
    );
  }

  // Nie filtrujemy po regionie — tylko po typach (dla porządku, ale nie obowiązkowe)
  const data = await res.json();
  const allowed = new Set(['locality', 'sublocality', 'route']);
  data.suggestions = (data?.suggestions ?? []).filter((s: any) => {
    const types: string[] = s?.placePrediction?.types ?? [];

    console.log('PLACES payload', payload);
    return types.some(t => allowed.has(t));
  });

  return NextResponse.json(data);
}
