// Shared address filtering and labeling utilities used by both server and client.

export const POI_KEYWORDS = [
  'szkoła',
  'szkola',
  'przedszkole',
  'szpital',
  'przychodnia',
  'klinika',
  'kościół',
  'kosciol',
  'parafia',
  'galeria',
  'centrum handlowe',
  'park',
  'skwer',
  'dworzec',
  'stacja',
  'urząd',
  'urzad',
  'muzeum',
  'teatr',
  'kino',
  'restauracja',
  'kawiarnia',
  'sklep',
  'market',
];

export function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function includesCzestochowa(label: string): boolean {
  const norm = normalize(label);
  return norm.includes('czestochowa');
}

export function hasHouseNumber(label: string): boolean {
  return /\d+/.test(label);
}

export function containsPoiKeyword(label: string): boolean {
  const lower = normalize(label);
  return POI_KEYWORDS.some(k => lower.includes(normalize(k)));
}

// Build a dedupe key based on the last token of the street name before number + the number.
// Example: "gen. Jana Henryka Dąbrowskiego 7" and "Dąbrowskiego 7" → same key
export function addressKeyForDedup(mainText: string): string {
  const n = normalize(mainText)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const m = n.match(/(\d+[a-z]?)(?:\b|$)/i);
  const number = m ? m[1] : '';
  const before =
    m && (m as any).index != null ? n.slice(0, (m as any).index).trim() : n;
  const parts = before.split(' ').filter(Boolean);
  const core = parts.length ? parts[parts.length - 1] : before;
  return `${core}|${number}`;
}

export type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

// Mirrors the server precedence used in Details route
export function buildLabelFromComponents(
  components: AddressComponent[] | undefined,
  formattedAddress: string,
  displayName: string
): string {
  const comps = components || [];
  const get = (t: string) => comps.find(c => (c.types || []).includes(t));
  const route = get('route')?.longText || get('route')?.shortText || '';
  const no =
    get('street_number')?.longText || get('street_number')?.shortText || '';
  const city = get('locality')?.longText || get('postal_town')?.longText || '';
  if (route && no) return `${route} ${no}${city ? `, ${city}` : ''}`;
  if (hasHouseNumber(formattedAddress)) return formattedAddress;
  return displayName || formattedAddress;
}
