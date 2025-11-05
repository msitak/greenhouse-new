import type { LocationValue } from '@/lib/location/types';

// Pull specific address component text (long or short)
export function getAddressComponentText(
  comps:
    | Array<{ longText?: string; shortText?: string; types?: string[] }>
    | undefined,
  type: string
): string | undefined {
  if (!comps?.length) return undefined;
  const hit = comps.find(c => (c.types || []).includes(type));
  return hit?.longText || hit?.shortText || undefined;
}

export function extractCityDistrictStreet(location?: LocationValue): {
  city?: string;
  district?: string;
  street?: string;
} {
  const city = getAddressComponentText(location?.addressComponents, 'locality');
  const district =
    getAddressComponentText(location?.addressComponents, 'sublocality') ||
    getAddressComponentText(
      location?.addressComponents,
      'administrative_area_level_3'
    );
  const street = getAddressComponentText(location?.addressComponents, 'route');
  return { city, district, street };
}

export function buildQueryParams(args: {
  kind: 'sale' | 'rent';
  propertyType: string;
  location?: LocationValue;
  price: [number | null, number | null];
  area: [number | null, number | null];
}): URLSearchParams {
  const { kind, propertyType, location, price, area } = args;
  const params = new URLSearchParams();
  params.set('kind', kind);
  if (propertyType && propertyType !== 'any')
    params.set('propertyType', propertyType);

  const { city, district, street } = extractCityDistrictStreet(location);
  if (city) params.set('city', city);
  if (district) params.set('district', district);
  if (street) params.set('street', street);
  // Fallback: allow plain city labels without components
  if (!city && location?.label && !location.label.includes(',')) {
    params.set('city', location.label.trim());
  }

  if (price[0] != null) params.set('priceMin', String(price[0]));
  if (price[1] != null) params.set('priceMax', String(price[1]));
  if (area[0] != null) params.set('areaMin', String(area[0]));
  if (area[1] != null) params.set('areaMax', String(area[1]));
  return params;
}

export function composeLocationLabelFromUrl(
  city?: string | null,
  district?: string | null
): string {
  const c = (city || '').trim();
  const d = (district || '').trim();
  if (d && c) return `${d}, ${c}`;
  return c || d || '';
}
