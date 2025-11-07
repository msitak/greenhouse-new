import {
  buildLabelFromComponents,
  AddressComponent,
} from '@/lib/filters/addressFilters';

const comps = (
  route: string | undefined,
  number: string | undefined,
  city: string | undefined
) =>
  [
    route ? { longText: route, types: ['route'] } : {},
    number ? { longText: number, types: ['street_number'] } : {},
    city ? { longText: city, types: ['locality'] } : {},
  ] as AddressComponent[];

describe('buildLabelFromComponents precedence', () => {
  it('uses route + street_number + city when available', () => {
    const label = buildLabelFromComponents(
      comps('Dąbrowskiego', '7', 'Częstochowa'),
      'fallback formatted',
      'fallback display'
    );
    expect(label).toBe('Dąbrowskiego 7, Częstochowa');
  });

  it('falls back to formattedAddress when components lack street_number but formatted has number', () => {
    const label = buildLabelFromComponents(
      comps('Dąbrowskiego', undefined, 'Częstochowa'),
      'Dąbrowskiego 7, Częstochowa',
      'display'
    );
    expect(label).toBe('Dąbrowskiego 7, Częstochowa');
  });

  it('finally falls back to displayName when neither components nor formatted have number', () => {
    const label = buildLabelFromComponents(
      comps('Dąbrowskiego', undefined, 'Częstochowa'),
      'Dąbrowskiego, Częstochowa',
      'Dąbrowskiego'
    );
    expect(label).toBe('Dąbrowskiego');
  });
});
