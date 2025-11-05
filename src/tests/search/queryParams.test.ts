import {
  buildQueryParams,
  getAddressComponentText,
} from '@/lib/search/queryParams';

const comp = (types: string[], longText: string) => ({ types, longText });

describe('search buildQueryParams', () => {
  it('uses locality as city', () => {
    const params = buildQueryParams({
      kind: 'sale',
      propertyType: 'any',
      location: {
        label: 'Częstochowa',
        addressComponents: [comp(['locality'], 'Częstochowa')],
      },
      price: [null, null],
      area: [null, null],
    });
    expect(params.get('city')).toBe('Częstochowa');
    expect(params.get('propertyType')).toBeNull();
  });

  it('includes district and city when sublocality present', () => {
    const params = buildQueryParams({
      kind: 'sale',
      propertyType: 'mieszkanie',
      location: {
        label: 'Tysiąclecie, Częstochowa',
        addressComponents: [
          comp(['sublocality'], 'Tysiąclecie'),
          comp(['locality'], 'Częstochowa'),
        ],
      },
      price: [null, null],
      area: [null, null],
    });
    expect(params.get('city')).toBe('Częstochowa');
    expect(params.get('district')).toBe('Tysiąclecie');
    expect(params.get('propertyType')).toBe('mieszkanie');
  });

  it('includes street along with city/district when route present', () => {
    const params = buildQueryParams({
      kind: 'rent',
      propertyType: 'any',
      location: {
        label: 'Aleja Armii Krajowej, Tysiąclecie, Częstochowa',
        addressComponents: [
          comp(['route'], 'Aleja Armii Krajowej'),
          comp(['sublocality'], 'Tysiąclecie'),
          comp(['locality'], 'Częstochowa'),
        ],
      },
      price: [1000, 3000],
      area: [30, 60],
    });
    expect(params.get('city')).toBe('Częstochowa');
    expect(params.get('district')).toBe('Tysiąclecie');
    expect(params.get('street')).toBe('Aleja Armii Krajowej');
    expect(params.get('priceMin')).toBe('1000');
    expect(params.get('areaMax')).toBe('60');
  });

  it('falls back to plain label as city when no components provided', () => {
    const params = buildQueryParams({
      kind: 'sale',
      propertyType: 'any',
      location: { label: 'Gliwice' },
      price: [null, null],
      area: [null, null],
    });
    expect(params.get('city')).toBe('Gliwice');
  });
});

describe('getAddressComponentText', () => {
  it('returns matching component by type', () => {
    const addressComponents = [
      comp(['route'], 'Prosta'),
      comp(['locality'], 'Warszawa'),
    ];
    expect(getAddressComponentText(addressComponents, 'locality')).toBe(
      'Warszawa'
    );
    expect(
      getAddressComponentText(addressComponents, 'sublocality')
    ).toBeUndefined();
  });
});
