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
};

const PRIMARY_CITY = 'Częstochowa';
const SUGGESTION_LIMIT = 12;

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const DISTRICT_SUGGESTIONS: LocationSuggestion[] = OFFICIAL_DISTRICTS.map(
  district => {
    const primary = formatDistrictName(district);
    return {
      id: `district-${normalizeText(primary)}`,
      label: `${primary}, ${PRIMARY_CITY}`,
      kind: 'district',
      primary,
      badge: `Dzielnica • ${PRIMARY_CITY}`,
      city: PRIMARY_CITY,
    };
  }
);

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
  const [inputValue, setInputValue] = React.useState(value?.label ?? '');

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
        const rows: Array<{ city?: string | null }> = Array.isArray(
          payload?.data
        )
          ? payload.data
          : [];
        const seen = new Set<string>();
        const formatted: string[] = [];
        for (const row of rows) {
          const raw = row?.city?.trim();
          if (!raw) continue;
          const pretty = formatDistrictName(raw);
          const key = normalizeText(pretty);
          if (seen.has(key)) continue;
          seen.add(key);
          formatted.push(pretty);
        }
        const czestochowaKey = normalizeText(PRIMARY_CITY);
        if (!seen.has(czestochowaKey)) {
          formatted.unshift(PRIMARY_CITY);
        }
        if (!controller.signal.aborted && formatted.length) {
          setCityNames(formatted);
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
      .map(name => ({
        id: `city-${normalizeText(name)}`,
        label: name,
        kind: 'city' as const,
        primary: name,
        badge: 'Miasto',
        city: name,
      }));
  }, [cityNames]);

  const suggestions = React.useMemo(
    () => [...citySuggestions, ...DISTRICT_SUGGESTIONS],
    [citySuggestions]
  );

  const filteredItems = React.useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return [];
    }
    const query = normalizeText(trimmed);
    return suggestions
      .filter(
        option =>
          normalizeText(option.primary).includes(query) ||
          normalizeText(option.label).includes(query)
      )
      .slice(0, SUGGESTION_LIMIT);
  }, [inputValue, suggestions]);

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
            {item.primary}
          </span>
          <span className='text-xs text-muted-foreground'>{item.badge}</span>
        </span>
      )}
    />
  );
}
