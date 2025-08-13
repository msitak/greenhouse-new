'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter } from 'lucide-react';

type PropertyType = 'dowolny' | 'mieszkanie' | 'dom' | 'dzialka' | 'lokal';

interface PropertySearchFormProps {
  className?: string;
}

export default function PropertySearchForm({
  className,
}: PropertySearchFormProps) {
  const [transactionType, setTransactionType] = useState<
    'sprzedaz' | 'wynajem'
  >('sprzedaz');
  const [propertyType, setPropertyType] = useState<PropertyType>('dowolny');
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([30, 2000]);
  const [location, setLocation] = useState('');

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'dowolny', label: 'Dowolny' },
    { value: 'mieszkanie', label: 'Mieszkanie' },
    { value: 'dom', label: 'Dom' },
    { value: 'dzialka', label: 'Działka' },
    { value: 'lokal', label: 'Lokal' },
  ];

  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);
    setIsPropertyTypeOpen(false);
  };

  const handleSearch = () => {
    // Handle search logic here
    console.log('Searching with:', {
      transactionType,
      propertyType,
      priceRange,
      areaRange,
      location,
    });
  };

  const clearFilters = () => {
    setTransactionType('sprzedaz');
    setPropertyType('dowolny');
    setPriceRange([0, 1000000]);
    setAreaRange([30, 2000]);
    setLocation('');
  };

  return (
    <div
      className={`bg-white rounded-3xl border-2 border-green-600 p-8 ${className}`}
    >
      {/* Transaction Type Toggles */}
      <div className='mb-6'>
        <ToggleGroup
          type='single'
          value={transactionType}
          onValueChange={value =>
            value && setTransactionType(value as 'sprzedaz' | 'wynajem')
          }
          className='flex gap-2'
        >
          <ToggleGroupItem
            value='sprzedaz'
            className={`px-6 py-2 rounded-full border transition-colors ${
              transactionType === 'sprzedaz'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
            }`}
          >
            Sprzedaż
          </ToggleGroupItem>
          <ToggleGroupItem
            value='wynajem'
            className={`px-6 py-2 rounded-full border transition-colors ${
              transactionType === 'wynajem'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-600'
            }`}
          >
            Wynajem
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left Column */}
        <div className='space-y-6'>
          {/* Property Type */}
          <div className='relative'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Typ nieruchomości
            </label>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
                className='w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors'
              >
                <span className='text-gray-900'>
                  {propertyTypes.find(t => t.value === propertyType)?.label}
                </span>
                <svg
                  className={`ml-2 h-4 w-4 inline transition-transform ${
                    isPropertyTypeOpen ? 'rotate-180' : ''
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {/* Dropdown - Fixed positioning to prevent 100vw issue */}
              {isPropertyTypeOpen && (
                <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto'>
                  {propertyTypes.map(type => (
                    <button
                      key={type.value}
                      type='button'
                      onClick={() => handlePropertyTypeChange(type.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                        propertyType === type.value
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Cena
            </label>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm text-gray-500'>zł</span>
              <span className='text-sm text-gray-500'>-</span>
              <span className='text-sm text-gray-500'>zł</span>
            </div>
            <div className='relative'>
              <div className='w-full h-2 bg-gray-200 rounded-full'>
                <div
                  className='h-2 bg-green-600 rounded-full'
                  style={{ width: '100%' }}
                ></div>
              </div>
              <input
                type='range'
                min='0'
                max='1000000'
                step='10000'
                value={priceRange[0]}
                onChange={e =>
                  setPriceRange([parseInt(e.target.value), priceRange[1]])
                }
                className='absolute top-0 w-full h-2 opacity-0 cursor-pointer'
              />
              <input
                type='range'
                min='0'
                max='1000000'
                step='10000'
                value={priceRange[1]}
                onChange={e =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className='absolute top-0 w-full h-2 opacity-0 cursor-pointer'
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='space-y-6'>
          {/* Location */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Lokalizacja
            </label>
            <input
              type='text'
              placeholder='np. województwo, miasto etc.'
              value={location}
              onChange={e => setLocation(e.target.value)}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors'
            />
          </div>

          {/* Area Range */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Powierzchnia
            </label>
            <div className='flex justify-between text-sm text-gray-500 mb-2'>
              <span>{areaRange[0]} m²</span>
              <span>-</span>
              <span>{areaRange[1]} m²</span>
            </div>
            <div className='relative'>
              <div className='w-full h-2 bg-gray-200 rounded-full'>
                <div
                  className='h-2 bg-green-600 rounded-full'
                  style={{ width: '100%' }}
                ></div>
              </div>
              <input
                type='range'
                min='30'
                max='2000'
                step='10'
                value={areaRange[0]}
                onChange={e =>
                  setAreaRange([parseInt(e.target.value), areaRange[1]])
                }
                className='absolute top-0 w-full h-2 opacity-0 cursor-pointer'
              />
              <input
                type='range'
                min='30'
                max='2000'
                step='10'
                value={areaRange[1]}
                onChange={e =>
                  setAreaRange([areaRange[0], parseInt(e.target.value)])
                }
                className='absolute top-0 w-full h-2 opacity-0 cursor-pointer'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className='flex justify-between items-center mt-8'>
        <button
          type='button'
          onClick={clearFilters}
          className='text-sm text-gray-500 hover:text-green-600 transition-colors'
        >
          Wyczyść kryteria
        </button>

        <div className='flex gap-3'>
          <Button
            variant='outline'
            className='border-green-600 text-green-600 hover:bg-green-50'
          >
            <Filter className='w-4 h-4 mr-2' />
            Wszystkie oferty
            <svg
              className='ml-2 h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </Button>
          <Button
            onClick={handleSearch}
            className='bg-green-600 hover:bg-green-700'
          >
            <Search className='w-4 h-4 mr-2' />
            Szukaj
          </Button>
        </div>
      </div>
    </div>
  );
}
