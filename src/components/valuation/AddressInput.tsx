'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

type AddressValue = {
  formattedAddress: string;
  street?: string;
  number?: string;
  postalCode?: string;
  city?: string;
};

type AddressInputProps = {
  value?: AddressValue;
  onChange: (value: AddressValue | undefined) => void;
};

export function AddressInput({ value, onChange }: AddressInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [predictions, setPredictions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState(false);
  const sessionTokenRef = React.useRef<any>(null);

  // Initialize session token
  React.useEffect(() => {
    if (typeof google !== 'undefined' && google.maps?.places) {
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  // Debounced fetch suggestions
  React.useEffect(() => {
    // Don't fetch if address was just selected
    if (selectedAddress) {
      setSelectedAddress(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (inputValue.length < 3) {
        setPredictions([]);
        return;
      }

      if (typeof google === 'undefined' || !google.maps?.places) return;

      setIsLoading(true);

      try {
        const { suggestions } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            {
              input: inputValue,
              sessionToken: sessionTokenRef.current,
              includedRegionCodes: ['PL'],
              // NO type filter - Google returns different types for same addresses
              locationRestriction: {
                west: 19.08,
                east: 19.15,
                south: 50.78,
                north: 50.85,
              },
              language: 'pl',
              region: 'PL',
            }
          );

        // Client-side filter: Częstochowa + has number + exclude obvious POIs
        const POI_KEYWORDS = [
          'galeria',
          'centrum handlowe',
          'szkoła',
          'szpital',
          'kościół',
          'park',
        ];
        const filtered = (suggestions || []).filter((s: any) => {
          const text = s.placePrediction?.text?.text || '';
          const lower = text.toLowerCase();
          const hasCzestochowa = lower.includes('częstochowa');
          const hasNumber = /\d/.test(text);
          const isPoi = POI_KEYWORDS.some(k => lower.includes(k));
          return hasCzestochowa && hasNumber && !isPoi;
        });

        setPredictions(filtered);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelect = async (suggestion: any) => {
    try {
      setIsLoading(true);

      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['formattedAddress', 'addressComponents'],
      });

      // Extract address components
      const components = place.addressComponents || [];
      const city = components.find((c: any) =>
        c.types?.includes('locality')
      )?.longText;

      // Only check if it's in Częstochowa
      if (city?.toLowerCase() !== 'częstochowa') {
        setInputValue('');
        setPredictions([]);
        sessionTokenRef.current =
          new google.maps.places.AutocompleteSessionToken();
        setIsLoading(false);
        return;
      }

      const addressData: AddressValue = {
        formattedAddress: place.formattedAddress || '',
        street: components.find((c: any) => c.types?.includes('route'))
          ?.longText,
        number: components.find((c: any) => c.types?.includes('street_number'))
          ?.longText,
        postalCode: components.find((c: any) =>
          c.types?.includes('postal_code')
        )?.longText,
        city,
      };

      onChange(addressData);
      setSelectedAddress(true);
      setInputValue(place.formattedAddress || '');
      setPredictions([]);
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    } catch (err) {
      console.error('Selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='grid gap-1'>
      <Label className='font-bold text-[12px]/[20px] text-black'>
        Adres nieruchomości
      </Label>
      <div className='relative'>
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder='Wpisz dokładny adres'
          className='rounded-xl bg-white border border-[#CCCCCC] text-[#6E6E6E] font-medium px-4 py-3 text-sm'
        />
        {predictions.length > 0 && (
          <ul className='absolute top-full left-0 right-0 mt-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50'>
            {predictions.map((s: any, idx: number) => (
              <li
                key={idx}
                onClick={() => handleSelect(s)}
                className='flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0'
              >
                <MapPin className='h-4 w-4 text-gray-400' />
                <span className='text-sm'>{s.placePrediction?.text?.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isLoading && <p className='text-xs text-[#6E6E6E] mt-1'>Ładowanie...</p>}
    </div>
  );
}
