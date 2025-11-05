export type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export function getAddressComponentText(
  comps: AddressComponent[] | undefined,
  type: string
): string | undefined {
  if (!comps?.length) return undefined;
  const hit = comps.find(c => (c.types || []).includes(type));
  return hit?.longText || hit?.shortText || undefined;
}

export function buildQueryParams(args: {
  kind: 'sale' | 'rent';
  propertyType: string;
  location?: {
    label?: string | null;
    addressComponents?: AddressComponent[];
  };
  price: [number | null, number | null];
  area: [number | null, number | null];
}): URLSearchParams {
  const { kind, propertyType, location, price, area } = args;
  const params = new URLSearchParams();
  params.set('kind', kind);
  if (propertyType && propertyType !== 'any')
    params.set('propertyType', propertyType);

  const city = getAddressComponentText(location?.addressComponents, 'locality');
  const district =
    getAddressComponentText(location?.addressComponents, 'sublocality') ||
    getAddressComponentText(
      location?.addressComponents,
      'administrative_area_level_3'
    );
  const route = getAddressComponentText(location?.addressComponents, 'route');
  if (city) params.set('city', city);
  else if (location?.label && !location.label.includes(','))
    params.set('city', location.label.trim());
  if (district) params.set('district', district);
  if (route) params.set('street', route);

  if (price[0] != null) params.set('priceMin', String(price[0]));
  if (price[1] != null) params.set('priceMax', String(price[1]));
  if (area[0] != null) params.set('areaMin', String(area[0]));
  if (area[1] != null) params.set('areaMax', String(area[1]));
  return params;
}
