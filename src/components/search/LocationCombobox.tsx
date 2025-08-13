'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import type { LocationValue } from '@/lib/location/types';
import { Autocomplete } from '@/components/ui/autocomplete';
import { usePlacesAutocomplete } from '@/lib/hooks/usePlacesAutocomplete';

export function LocationCombobox({
  value,
  onChange,
  placeholder = 'np. województwo, miasto etc.',
}: {
  value?: LocationValue;
  onChange: (v: LocationValue) => void;
  placeholder?: string;
}) {
  const { text, setText, items, pickById, clear } =
    usePlacesAutocomplete(value);

  return (
    <Autocomplete
      value={text}
      onValueChange={v => setText(v)}
      items={items}
      clearOnCloseIfNoSelection
      onSelect={item => {
        onChange({
          label: item.label,
          placeId: item.id.toString(),
          lat: 0,
          lng: 0,
        }); // bez lat/lng/bbox
        setText(item.label);
      }}
      placeholder={placeholder}
      menuWidth={520}
      renderItem={it => (
        <div className='flex items-center gap-2'>
          <MapPin className='h-4 w-4' />
          <span>{it.label}</span>
        </div>
      )}
    />
  );
}
