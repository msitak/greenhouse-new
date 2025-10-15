import { NextRequest, NextResponse } from 'next/server';

// Bounding box for Poland – used as a locationRestriction (harder constraint)
const POLAND_RECT = {
  low: { latitude: 49.0, longitude: 14.07 },
  high: { latitude: 54.84, longitude: 24.15 },
};

// Bounding box for Śląskie – used as a locationBias (soft preference)
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
    // Support cities, districts (sublocality) and streets
    includedPrimaryTypes: ['locality', 'sublocality', 'route'],
    // Can't set both restriction and bias together. We restrict to Poland via regionCodes,
    // and apply a soft bias to Śląskie.
    locationBias: { rectangle: SILESIAN_RECT },
    // Improve ranking around Częstochowa as the most common use-case
    origin: { latitude: 50.811, longitude: 19.120 },
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
          'suggestions.placePrediction.structuredFormat.mainText.text,' +
          'suggestions.placePrediction.structuredFormat.secondaryText.text,' +
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

  // helper: normalize for diacritics-insensitive compare
  const normalize = (str: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const nq = normalize(input);

  let suggestions = (data?.suggestions ?? [])
    // keep only locality-type predictions (cities, towns, villages)
    .filter((s: any) => {
      const types: string[] = s?.placePrediction?.types ?? [];
      return types.some(t => allowed.has(t));
    })
    // ensure mainText matches the typed query, to avoid county-name matches
    .filter((s: any) => {
      const main: string =
        s?.placePrediction?.structuredFormat?.mainText?.text ||
        s?.placePrediction?.text?.text ||
        '';
      return normalize(main).includes(nq);
    });

  // Re-rank: prefer Częstochowa (business requirement) and sublocality/route
  const tokens = nq.split(/\s+/).filter(Boolean);
  const preferCity = 'czestochowa';
  suggestions = suggestions
    .map((s: any) => {
      const main: string = s?.placePrediction?.structuredFormat?.mainText?.text || '';
      const secondary: string = s?.placePrediction?.structuredFormat?.secondaryText?.text || '';
      const all = `${main}, ${secondary}`;
      const types: string[] = s?.placePrediction?.types || [];
      const typeScore = types.includes('sublocality') ? 8 : types.includes('route') ? 6 : types.includes('locality') ? 3 : 0;
      const cityBoost = normalize(all).includes(preferCity) ? 20 : 0;
      const tokenScore = tokens.reduce((acc, t) => acc + (normalize(all).includes(t) ? 1 : 0), 0);
      const score = typeScore + cityBoost + tokenScore;
      return { s, score };
    })
    .sort((a: any, b: any) => b.score - a.score)
    .map((x: any) => x.s);

  data.suggestions = suggestions;

  return NextResponse.json(data);
}
