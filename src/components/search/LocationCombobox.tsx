'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
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
      inputClassName='rounded-xl bg-white border border-[#CCCCCC] text-[#6E6E6E] font-medium w-full px-4 py-3 text-sm'
      clearOnCloseIfNoSelection
      menuWidth='400px'
      onSelect={async item => {
        // Fetch details to get precise lat/lng and components
        await pickById(item.id, item.label, next => {
          onChange(next);
          setText(next.label);
        });
      }}
      placeholder={placeholder}
      renderItem={it => (
        <div className='flex items-center gap-2 w-full'>
          <MapPin className='h-4 w-4' />
          <span>{it.label}</span>
        </div>
      )}
    />
  );
}
