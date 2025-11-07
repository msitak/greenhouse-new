import { normalize } from '@/lib/filters/addressFilters';

describe('normalize()', () => {
  it('removes diacritics and lowercases text', () => {
    expect(normalize('Dąbrowskiego')).toBe('dabrowskiego');
    expect(normalize('CzęstoChowa')).toBe('czestochowa');
  });

  it('handles empty or undefined safely', () => {
    // @ts-expect-error testing undefined input
    expect(normalize(undefined)).toBe('');
    // @ts-expect-error testing null input
    expect(normalize(null)).toBe('');
    expect(normalize('')).toBe('');
  });

  it('supports substring checks across variants', () => {
    const city = normalize('Częstochowa, Polska');
    expect(city.includes('czestochowa')).toBe(true);
  });
});
