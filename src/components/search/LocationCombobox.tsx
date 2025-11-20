'use client';

import * as React from 'react';
import type { LocationValue } from '@/lib/location/types';
import {
  Autocomplete,
  type AutocompleteItem,
} from '@/components/ui/autocomplete';
import {
  OFFICIAL_DISTRICTS,
  formatDistrictName,
} from '@/lib/location/districts';

type LocationSuggestion = AutocompleteItem & {
  kind: 'city' | 'district';
  primary: string;
  badge: string;
  city?: string;
  count?: number;
};

const PRIMARY_CITY = 'Częstochowa';
const DESKTOP_SUGGESTION_LIMIT = 7;
const MOBILE_SUGGESTION_LIMIT = 5;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function buildLocationValue(option: LocationSuggestion): LocationValue {
  const addressComponents =
    option.kind === 'city'
      ? [
          {
            longText: option.primary,
            shortText: option.primary,
            types: ['locality'],
          },
        ]
      : [
          {
            longText: option.primary,
            shortText: option.primary,
            types: ['sublocality'],
          },
          {
            longText: option.city ?? PRIMARY_CITY,
            shortText: option.city ?? PRIMARY_CITY,
            types: ['locality'],
          },
        ];

  return {
    label: option.label,
    placeId: option.id,
    lat: 0,
    lng: 0,
    addressComponents,
    types: option.kind === 'city' ? ['locality'] : ['sublocality'],
  };
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = 'np. Częstochowa, Raków',
}: {
  value?: LocationValue;
  onChange: (v: LocationValue | undefined) => void;
  placeholder?: string;
}) {
  const [cityNames, setCityNames] = React.useState<string[]>([PRIMARY_CITY]);
  const [cityCounts, setCityCounts] = React.useState<Record<string, number>>(
    () => ({ [normalizeText(PRIMARY_CITY)]: 0 })
  );
  const [districtCounts, setDistrictCounts] = React.useState<
    Record<string, number>
  >({});
  const [inputValue, setInputValue] = React.useState(value?.label ?? '');
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.matchMedia('(min-width: 768px)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handler = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchDistricts() {
      try {
        const response = await fetch('/api/listings/districts-count', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        const rows: Array<{ district?: string | null; count?: number }> =
          Array.isArray(payload?.data) ? payload.data : [];
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const pretty = row?.district ? formatDistrictName(row.district) : '';
          if (!pretty) continue;
          const key = normalizeText(pretty);
          counts[key] = typeof row?.count === 'number' ? row.count : 0;
        }
        if (!controller.signal.aborted) {
          setDistrictCounts(counts);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.warn('Failed to fetch district suggestions', error);
      }
    }

    fetchDistricts();
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    setInputValue(value?.label ?? '');
  }, [value?.label]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchCities() {
      try {
        const response = await fetch('/api/listings/cities-count', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        const rows: Array<{ city?: string | null; count?: number }> =
          Array.isArray(payload?.data) ? payload.data : [];
        const seen = new Set<string>();
        const formatted: string[] = [];
        const counts: Record<string, number> = {};
        for (const row of rows) {
          const raw = row?.city?.trim();
          if (!raw) continue;
          const pretty = formatDistrictName(raw);
          const key = normalizeText(pretty);
          if (seen.has(key)) continue;
          seen.add(key);
          formatted.push(pretty);
          counts[key] = typeof row?.count === 'number' ? row.count : 0;
        }
        const czestochowaKey = normalizeText(PRIMARY_CITY);
        if (!seen.has(czestochowaKey)) {
          formatted.unshift(PRIMARY_CITY);
          if (!(czestochowaKey in counts)) {
            counts[czestochowaKey] = 0;
          }
        }
        if (!controller.signal.aborted && formatted.length) {
          setCityNames(formatted);
          setCityCounts(counts);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.warn('Failed to fetch city suggestions', error);
      }
    }

    fetchCities();
    return () => controller.abort();
  }, []);

  const citySuggestions = React.useMemo<LocationSuggestion[]>(() => {
    const seen = new Set<string>();
    return cityNames
      .map(name => formatDistrictName(name))
      .filter(name => {
        const key = normalizeText(name);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .map(name => {
        const key = normalizeText(name);
        return {
          id: `city-${key}`,
          label: name,
          kind: 'city' as const,
          primary: name,
          badge: 'Miasto',
          city: name,
          count: cityCounts[key] ?? 0,
        };
      });
  }, [cityCounts, cityNames]);

  const districtSuggestions = React.useMemo<LocationSuggestion[]>(
    () =>
      OFFICIAL_DISTRICTS.map(district => {
        const primary = formatDistrictName(district);
        const key = normalizeText(primary);
        return {
          id: `district-${key}`,
          label: `${primary}, ${PRIMARY_CITY}`,
          kind: 'district' as const,
          primary,
          badge: `Dzielnica • ${PRIMARY_CITY}`,
          city: PRIMARY_CITY,
          count: districtCounts[key] ?? 0,
        };
      }),
    [districtCounts]
  );

  const suggestions = React.useMemo(
    () => [...citySuggestions, ...districtSuggestions],
    [citySuggestions, districtSuggestions]
  );

  const suggestionLimit = isDesktop
    ? DESKTOP_SUGGESTION_LIMIT
    : MOBILE_SUGGESTION_LIMIT;

  const filteredItems = React.useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return [];
    }
    const normalizedQuery = normalizeText(trimmed);
    const matches = suggestions
      .map(option => {
        const normalizedLabel = normalizeText(option.label);
        const normalizedPrimary = normalizeText(option.primary);
        const isMatch =
          normalizedPrimary.includes(normalizedQuery) ||
          normalizedLabel.includes(normalizedQuery);
        if (!isMatch) {
          return null;
        }
        const primaryStartsWith = normalizedPrimary.startsWith(normalizedQuery)
          ? 1
          : 0;
        return {
          option,
          primaryStartsWith,
          count: option.count ?? 0,
          normalizedPrimary,
        };
      })
      .filter(
        (
          value
        ): value is {
          option: LocationSuggestion;
          primaryStartsWith: number;
          count: number;
          normalizedPrimary: string;
        } => value !== null
      )
      .sort((a, b) => {
        if (b.primaryStartsWith !== a.primaryStartsWith) {
          return b.primaryStartsWith - a.primaryStartsWith;
        }
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.normalizedPrimary.localeCompare(b.normalizedPrimary);
      })
      .map(entry => entry.option);

    return matches.slice(0, suggestionLimit);
  }, [inputValue, suggestionLimit, suggestions]);

  return (
    <Autocomplete
      value={inputValue}
      onValueChange={text => {
        setInputValue(text);
        if (text.trim() === '') {
          onChange(undefined);
        }
      }}
      items={filteredItems}
      contentClassName='!bg-white !text-[#111] !rounded-2xl !border !border-[#E5E5E5] shadow-[0_16px_40px_rgba(15,23,42,0.08)]'
      inputClassName='rounded-xl bg-[#F7F7F7] md:bg-white border-0 md:border md:border-[#CCCCCC] text-[#6E6E6E] font-normal md:font-medium w-full px-3 h-11 md:h-auto md:px-4 md:py-3 text-sm'
      clearOnCloseIfNoSelection
      menuWidth={undefined}
      onSelect={item => {
        const locationValue = buildLocationValue(item);
        onChange(locationValue);
        setInputValue(locationValue.label);
      }}
      placeholder={placeholder}
      renderItem={item => (
        <span className='flex flex-col text-left'>
          <span className='font-medium text-sm text-[#111]'>
            {item.primary}{' '}
            <span className='text-xs text-muted-foreground'>
              ({item.count ?? 0})
            </span>
          </span>
          <span className='text-xs text-muted-foreground'>{item.badge}</span>
        </span>
      )}
    />
  );
}
