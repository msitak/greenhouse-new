export const OFFICIAL_DISTRICTS = [
  'BŁESZNO',
  'CZĘSTOCHÓWKA-PARKITKA',
  'DŹBÓW',
  'GNASZYN-KAWODRZA',
  'GRABÓWKA',
  'KIEDRZYN',
  'LISINIEC',
  'MIRÓW',
  'OSTATNI GROSZ',
  'PODJASNOGÓRSKA',
  'PÓŁNOC',
  'RAKÓW',
  'STARE MIASTO',
  'STRADOM',
  'ŚRÓDMIEŚCIE',
  'TRZECH WIESZCZÓW',
  'TYSIĄCLECIE',
  'WRZOSOWIAK',
  'WYCZERPY-ANIOŁÓW',
  'ZAWODZIE-DĄBIE',
] as const;

export function formatDistrictName(name: string): string {
  if (!name) {
    return '';
  }

  return name
    .split('-')
    .map(segment => {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) {
        return '';
      }
      return trimmedSegment
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    })
    .join('-')
    .trim();
}
