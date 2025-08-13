import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const placeId = sp.get('placeId');
  const sessionToken = sp.get('sessionToken') ?? '';
  const languageCode = sp.get('languageCode') ?? 'pl';

  if (!placeId)
    return NextResponse.json({ error: 'MISSING_PLACE_ID' }, { status: 400 });

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.PLACES_API_KEY || '',
      'X-Goog-FieldMask':
        'id,displayName,location,viewport,types,addressComponents',
      ...(sessionToken ? { 'X-Goog-Maps-Session-Token': sessionToken } : {}),
      ...(languageCode ? { 'Accept-Language': languageCode } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: 'PLACES_DETAILS_FAILED', detail: text },
      { status: res.status }
    );
  }

  const d = await res.json();
  const id = d?.id ?? placeId;
  const label = d?.displayName?.text ?? '';
  const lat = d?.location?.latitude ?? d?.location?.lat ?? null;
  const lng = d?.location?.longitude ?? d?.location?.lng ?? null;
  const viewport = d?.viewport
    ? {
        ne: {
          lat:
            d.viewport.high?.latitude ?? d.viewport.northeast?.latitude ?? null,
          lng:
            d.viewport.high?.longitude ??
            d.viewport.northeast?.longitude ??
            null,
        },
        sw: {
          lat:
            d.viewport.low?.latitude ?? d.viewport.southwest?.latitude ?? null,
          lng:
            d.viewport.low?.longitude ??
            d.viewport.southwest?.longitude ??
            null,
        },
      }
    : undefined;

  return NextResponse.json({ id, label, lat, lng, viewport });
}
