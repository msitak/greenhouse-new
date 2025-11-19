import { describe, it, expect } from '@jest/globals';

import {
  normalizeLocation,
  OFFICIAL_DISTRICTS,
} from '@/lib/utils/district-normalization';

describe('normalizeLocation', () => {
  describe('simple mapping (happy path)', () => {
    it('returns BŁESZNO for Bakaliowa without district hint', () => {
      expect(normalizeLocation('Częstochowa', null, 'Bakaliowa', null)).toBe(
        'Błeszno'
      );
    });

    it('matches truncated Okulickiego input to the official district', () => {
      expect(normalizeLocation('Częstochowa', null, 'Okulickiego', null)).toBe(
        'Częstochówka-Parkitka'
      );
    });
  });

  describe('input normalization (messy data)', () => {
    it('is case-insensitive and strips generic prefixes', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'ul. bAkAliOwA', null)
      ).toBe('Błeszno');
    });

    it('handles aleja prefix for split street resolution', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Armii Krajowej', '10')
      ).toBe('Tysiąclecie');
    });

    it('normalizes saint prefixes with diacritics', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'ul. Św. Rocha', '150')
      ).toBe('Częstochówka-Parkitka');
    });
  });

  describe('split streets logic', () => {
    it('returns null for Aleja Wolności when house number is missing', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Wolności', null)
      ).toBeNull();
    });

    it('maps Aleja Wolności odd numbers ≥51 to TRZECH WIESZCZÓW', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Wolności', '51')
      ).toBe('Trzech Wieszczów');
    });

    it('maps Aleja Wolności even numbers ≥44 to TRZECH WIESZCZÓW', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Wolności', '44')
      ).toBe('Trzech Wieszczów');
    });

    it('maps Aleja Wolności low even numbers to ŚRÓDMIEŚCIE', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Wolności', '2')
      ).toBe('Śródmieście');
    });

    it('maps Aleja Wolności low odd numbers to ŚRÓDMIEŚCIE', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Wolności', '5')
      ).toBe('Śródmieście');
    });

    it('maps Aleja Jana Pawła II low even numbers to STARE MIASTO', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Jana Pawła II', '10')
      ).toBe('Stare Miasto');
    });

    it('maps Aleja Jana Pawła II high even numbers to CZĘSTOCHÓWKA-PARKITKA', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Aleja Jana Pawła II', '200')
      ).toBe('Częstochówka-Parkitka');
    });
  });

  describe('fallback logic', () => {
    it('normalizes fuzzy district name Parkitka to official entry', () => {
      const result = normalizeLocation('Częstochowa', 'Parkitka', null, null);
      expect(result).toBe('Częstochówka-Parkitka');
      expect(OFFICIAL_DISTRICTS).toContain('CZĘSTOCHÓWKA-PARKITKA');
    });

    it('uppercases already valid district names', () => {
      const result = normalizeLocation(
        'Częstochowa',
        'Tysiąclecie',
        null,
        null
      );
      expect(result).toBe('Tysiąclecie');
      expect(OFFICIAL_DISTRICTS).toContain('TYSIĄCLECIE');
    });
  });

  describe('city guard', () => {
    it('bypasses normalization when city is not Częstochowa', () => {
      expect(normalizeLocation('Warszawa', 'MOKOTÓW', 'Puławska', '10')).toBe(
        'Mokotów'
      );
    });

    it('formats raw district when city is missing', () => {
      expect(normalizeLocation(null, 'ŚRÓDMIEŚCIE', null, null)).toBe(
        'Śródmieście'
      );
    });
  });

  describe('edge cases', () => {
    it('returns the raw district when street is unknown but district is provided', () => {
      expect(
        normalizeLocation(
          'Częstochowa',
          'Eksperymentalna',
          'Ulica Nieznana',
          null
        )
      ).toBe('Eksperymentalna');
    });

    it('returns null when both street and district are missing', () => {
      expect(normalizeLocation('Częstochowa', null, null, null)).toBeNull();
    });

    it('returns null when street is unknown and district is absent', () => {
      expect(
        normalizeLocation('Częstochowa', null, 'Ulica Nieznana', null)
      ).toBeNull();
    });
  });

  it('should handle double prefixes (garbage data)', () => {
    // al. Aleja -> powinno zostać "niepodleglosci" -> OSTATNI GROSZ (lub WRZOSOWIAK zależnie od mapy)
    expect(
      normalizeLocation('Częstochowa', null, 'al. Aleja Niepodległości', '1')
    ).toBe('Ostatni Grosz');

    // ul. Ulica -> powinno zostać "okulickiego"
    expect(
      normalizeLocation(
        'Częstochowa',
        null,
        'ul. Ulica Gen. Leopolda Okulickiego',
        null
      )
    ).toBe('Częstochówka-Parkitka');

    // Case sensitive + double prefix + typo
    expect(normalizeLocation('Częstochowa', null, 'Al. aleja NMP', '5')).toBe(
      'Stare Miasto'
    ); // NMP jest w Twoim configu? Jeśli nie, dodaj "nmp" -> "najświętszej maryi panny" w mapie.
  });

  describe('house number parsing robustness', () => {
    const trickyNumbers = ['51a', '51/53', '51 m 2'];

    trickyNumbers.forEach(number => {
      it(`extracts numeric value from "${number}"`, () => {
        expect(
          normalizeLocation('Częstochowa', null, 'Aleja Wolności', number)
        ).toBe('Trzech Wieszczów');
      });
    });
  });
});
