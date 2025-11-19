'use client';

import * as React from 'react';
import type { LocationValue } from '@/lib/location/types';
import { Autocomplete } from '@/components/ui/autocomplete';
import { usePlacesAutocomplete } from '@/lib/hooks/usePlacesAutocomplete';

export function LocationCombobox({
  value,
  onChange,
  placeholder = 'np. Katowice, Częstochowa…',
}: {
  value?: LocationValue;
  onChange: (v: LocationValue | undefined) => void;
  placeholder?: string;
}) {
  const { text, setText, items, pickById } = usePlacesAutocomplete(value);

  // If there is a selected value and the input text becomes empty (e.g., user clicked X),
  // propagate clearing to the parent so dependent counters refresh.
  React.useEffect(() => {
    if (value && text.trim() === '') {
      onChange(undefined);
    }
  }, [text, value, onChange]);

  return (
    <Autocomplete
      value={text}
      onValueChange={v => setText(v)}
      items={items}
      inputClassName='rounded-xl bg-[#F7F7F7] md:bg-white border-0 md:border md:border-[#CCCCCC] text-[#6E6E6E] font-normal md:font-medium w-full px-3 h-11 md:h-auto md:px-4 md:py-3 text-sm'
      clearOnCloseIfNoSelection
      menuWidth={undefined}
      onSelect={async item => {
        // Fetch details to get precise lat/lng and components
        await pickById(item.id, item.label, next => {
          onChange(next);
          setText(next.label);
        });
      }}
      placeholder={placeholder}
      renderItem={it => <span className='truncate'>{it.label}</span>}
    />
  );
}
