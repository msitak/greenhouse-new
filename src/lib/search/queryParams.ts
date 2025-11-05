import type { LocationValue } from '@/lib/location/types';

// Helper: pull a specific address component text (long or short)
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

export type RangeTuple = [number | null, number | null];

export function buildQueryParams(args: {
  kind: 'sale' | 'rent';
  propertyType: string;
  location?: Pick<LocationValue, 'label' | 'addressComponents'>;
  price: RangeTuple;
  area: RangeTuple;
}): URLSearchParams {
  const { kind, propertyType, location, price, area } = args;
  const params = new URLSearchParams();
  params.set('kind', kind);
  if (propertyType && propertyType !== 'any')
    params.set('propertyType', propertyType);

  const city = getAddressComponentText(location?.addressComponents, 'locality');
  if (city) params.set('city', city);
  const district =
    getAddressComponentText(location?.addressComponents, 'sublocality') ||
    getAddressComponentText(
      location?.addressComponents,
      'administrative_area_level_3'
    );
  const route = getAddressComponentText(location?.addressComponents, 'route');
  if (district) params.set('district', district);
  if (route) params.set('street', route);
  if (
    !city &&
    !district &&
    !route &&
    location?.label &&
    !location.label.includes(',')
  ) {
    // Fallback for plain city names entered directly
    params.set('city', location.label.trim());
  }

  if (price[0] != null) params.set('priceMin', String(price[0]));
  if (price[1] != null) params.set('priceMax', String(price[1]));
  if (area[0] != null) params.set('areaMin', String(area[0]));
  if (area[1] != null) params.set('areaMax', String(area[1]));
  return params;
}
