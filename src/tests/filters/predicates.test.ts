import {
  includesCzestochowa,
  hasHouseNumber,
  containsPoiKeyword,
} from '@/lib/filters/addressFilters';

describe('filters: city/number/POI', () => {
  it('detects Częstochowa regardless of diacritics', () => {
    expect(includesCzestochowa('Częstochowa')).toBe(true);
    expect(includesCzestochowa('czestochowa')).toBe(true);
    expect(includesCzestochowa('Warszawa')).toBe(false);
  });

  it('detects house numbers', () => {
    expect(hasHouseNumber('Dąbrowskiego 7, Częstochowa')).toBe(true);
    expect(hasHouseNumber('Dąbrowskiego, Częstochowa')).toBe(false);
  });

  it('filters out POI keywords', () => {
    expect(containsPoiKeyword('Park 3 Maja')).toBe(true);
    expect(containsPoiKeyword('Szpitalna 12')).toBe(true); // contains szpital as prefix
    expect(containsPoiKeyword('Dąbrowskiego 7')).toBe(false);
  });
});
