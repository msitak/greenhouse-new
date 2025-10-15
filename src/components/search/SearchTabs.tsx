'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationCombobox } from '@/components/search/LocationCombobox';
import type { LocationValue } from '@/lib/location/types';
import { PriceRangeField } from '@/components/search/PriceRangeField';
import { AreaRangeField } from '@/components/search/AreaRangeField';
import { DualRange } from '@/components/search/DualRange';
import type { RangeValue } from '@/lib/hooks/useRange';
import { Label } from '@/components/ui/label';

type SearchTabsProps = {
  className?: string;
  defaultValue?: 'sale' | 'rent';
  saleContent?: React.ReactNode;
  rentContent?: React.ReactNode;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
};

export default function SearchTabs({
  className,
  defaultValue = 'sale',
  saleContent = '1',
  rentContent = '2',
  priceMin,
  priceMax,
  areaMin,
  areaMax,
}: SearchTabsProps) {
  type PropertyType = 'any' | 'mieszkanie' | 'dom' | 'dzialka' | 'lokal';
  const [filters, setFilters] = React.useState<{ propertyType: PropertyType }>(
    { propertyType: 'any' }
  );

  const handlePropertyTypeChange = (value: string) => {
    const v = (value as PropertyType) || 'any';
    setFilters((prev) => ({ ...prev, propertyType: v }));
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine current tab from URL `kind` param; fallback to defaultValue
  const currentKind = ((): 'sale' | 'rent' => {
    const k = searchParams?.get('kind');
    return k === 'rent' || k === 'sale' ? k : defaultValue;
  })();

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('kind', value);
    // reset pagination on tab change
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Location state synced with URL param `city`
  const initialCity = searchParams?.get('city') || '';
  const [location, setLocation] = React.useState<LocationValue | undefined>(
    initialCity ? { label: initialCity, placeId: '', lat: 0, lng: 0 } : undefined
  );

  const onLocationChange = (loc: LocationValue) => {
    // Stage only; do not update URL until user clicks "Szukaj"
    setLocation(loc);
  };

  // Price and area ranges synced with URL
  const parseNum = (s: string | null) => {
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const [price, setPrice] = React.useState<RangeValue>([
    parseNum(searchParams?.get('priceMin')),
    parseNum(searchParams?.get('priceMax')),
  ]);
  const [area, setArea] = React.useState<RangeValue>([
    parseNum(searchParams?.get('areaMin')),
    parseNum(searchParams?.get('areaMax')),
  ]);

  // dynamic bounds state; start with server-provided defaults
  const [bounds, setBounds] = React.useState({
    minPrice: priceMin ?? 0,
    maxPrice: priceMax ?? (currentKind === 'rent' ? 20000 : 2000000),
    minArea: areaMin ?? 0,
    maxArea: areaMax ?? 1000,
  });

  const updateUrlRange = (keyMin: string, keyMax: string, v: RangeValue) => {
    // Staging only; URL updates on "Szukaj"
    // No-op here, we keep the helper for future use
  };

  // Live count fetcher
  const [count, setCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set('kind', currentKind);
    if (filters.propertyType && filters.propertyType !== 'any') {
      params.set('propertyType', filters.propertyType);
    }
    // Stage location -> city/district/street
    if (location?.label) params.set('city', location.label);
    const comps = location?.addressComponents || [];
    const findComp = (type: string) =>
      comps.find(c => (c.types || []).includes(type))?.longText ||
      comps.find(c => (c.types || []).includes(type))?.shortText;
    const district = findComp('sublocality') || findComp('administrative_area_level_3');
    const route = findComp('route');
    if (district) params.set('district', district);
    if (route) params.set('street', route);
    // Stage ranges
    if (price[0] != null) params.set('priceMin', String(price[0]));
    if (price[1] != null) params.set('priceMax', String(price[1]));
    if (area[0] != null) params.set('areaMin', String(area[0]));
    if (area[1] != null) params.set('areaMax', String(area[1]));

    fetch(`/api/listings/count?${params.toString()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setCount(typeof d?.count === 'number' ? d.count : 0))
      .catch(() => setCount(null));

    // Also fetch dynamic bounds whenever staged filters that affect dataset change
    fetch(`/api/listings/bounds?${params.toString()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setBounds({
          minPrice: typeof d?.minPrice === 'number' ? d.minPrice : 0,
          maxPrice: typeof d?.maxPrice === 'number' ? d.maxPrice : (currentKind === 'rent' ? 20000 : 2000000),
          minArea: typeof d?.minArea === 'number' ? d.minArea : 0,
          maxArea: typeof d?.maxArea === 'number' ? d.maxArea : 1000,
        });
      })
      .catch(() => void 0);
    return () => controller.abort();
  }, [currentKind, filters.propertyType, location, price, area]);

  const clearLocation = () => {
    setLocation(undefined);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('city');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section
      className={cn(
        'rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]',
        className
      )}
    >
      <Tabs value={currentKind} onValueChange={onTabChange}>
        <TabsList className='grid grid-cols-2 w-full'>
          <TabsTrigger value='sale'>Sprzedaż</TabsTrigger>
          <TabsTrigger value='rent'>Wynajem</TabsTrigger>
        </TabsList>
        <TabsContent value='sale'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
            <div className='flex flex-col gap-2'>
              <Label>Typ nieruchomości</Label>
              <Select
                value={filters.propertyType === 'any' ? 'any' : filters.propertyType}
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className='rounded-xl bg-white border-1 border-[#CCCCCC] text-[#6E6E6E] font-medium w-full px-4 py-3 text-sm cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Dowolny</SelectItem>
                  <SelectItem value='mieszkanie'>Mieszkanie</SelectItem>
                  <SelectItem value='dom'>Dom</SelectItem>
                  <SelectItem value='dzialka'>Działka</SelectItem>
                  <SelectItem value='lokal'>Lokal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Lokalizacja</Label>
              <div className='flex items-center gap-2'>
                <LocationCombobox value={location} onChange={onLocationChange} placeholder='np. Katowice, Gliwice, ulica…' />
              </div>
            </div>
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <PriceRangeField
                  id='price-sale'
                  dealType='sale'
                  min={bounds.minPrice}
                  max={bounds.maxPrice}
                  value={price}
                  onChange={v => {
                    setPrice(v);
                    updateUrlRange('priceMin', 'priceMax', v);
                  }}
                />
                <DualRange
                  id='area'
                  label='Powierzchnia'
                  unit='m²'
                  min={bounds.minArea}
                  max={bounds.maxArea}
                  step={1}
                  value={area}
                  onChange={v => {
                    setArea(v);
                    updateUrlRange('areaMin', 'areaMax', v);
                  }}
                  minDistance={1}
                  updateStrategy='throttle'
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='rent'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
            <div className='flex flex-col gap-2 md:w-[520px]'>
              <Label>Lokalizacja</Label>
              <div className='flex items-center gap-2'>
                <LocationCombobox value={location} onChange={onLocationChange} placeholder='np. Katowice, Gliwice, ulica…' />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Typ nieruchomości</Label>
              <Select
                value={filters.propertyType === 'any' ? undefined : filters.propertyType}
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className='rounded-xl bg-white border-1 border-[#CCCCCC] text-[#6E6E6E] font-medium w-full px-4 py-3 text-sm cursor-pointer'>
                  <SelectValue placeholder='Dowolny' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mieszkanie'>Mieszkanie</SelectItem>
                  <SelectItem value='dom'>Dom</SelectItem>
                  <SelectItem value='dzialka'>Działka</SelectItem>
                  <SelectItem value='lokal'>Lokal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <PriceRangeField
                  id='price-rent'
                  dealType='rent'
                  min={bounds.minPrice}
                  max={bounds.maxPrice}
                  value={price}
                  onChange={v => {
                    setPrice(v);
                    updateUrlRange('priceMin', 'priceMax', v);
                  }}
                />
                <DualRange
                  id='area-rent'
                  label='Powierzchnia'
                  unit='m²'
                  min={bounds.minArea}
                  max={bounds.maxArea}
                  step={1}
                  value={area}
                  onChange={v => {
                    setArea(v);
                    updateUrlRange('areaMin', 'areaMax', v);
                  }}
                  minDistance={1}
                  updateStrategy='throttle'
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className='flex items-center justify-between px-6 pb-4'>
        <button
          type='button'
          className='flex items-center gap-2 text-xs font-semibold hover:bg-[#00000006] py-4 px-8 rounded-xl cursor-pointer'
          onClick={() => {
            // Clear staged state
            setLocation(undefined);
            setPrice([null, null]);
            setArea([null, null]);
            setFilters({ propertyType: 'any' });
            // Clear URL filters without navigating/scrolling
            const params = new URLSearchParams(searchParams?.toString() || '');
            ['city','district','street','priceMin','priceMax','areaMin','areaMax','propertyType','page'].forEach(k => params.delete(k));
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
        >
          Wyczyść kryteria
          <span aria-hidden>×</span>
        </button>

        <button
          type='button'
          className='bg-green-primary text-white rounded-[8px] px-6 py-4 text-sm/[20px] font-semibold flex items-center gap-3 cursor-pointer hover:bg-[#76B837]'
          onClick={() => {
            const params = new URLSearchParams(searchParams?.toString() || '');
            // Apply staged filters
            params.set('kind', currentKind);
            if (filters.propertyType && filters.propertyType !== 'any') params.set('propertyType', filters.propertyType); else params.delete('propertyType');
            if (location?.label) params.set('city', location.label); else params.delete('city');
            const comps = location?.addressComponents || [];
            const findComp = (type: string) =>
              comps.find(c => (c.types || []).includes(type))?.longText ||
              comps.find(c => (c.types || []).includes(type))?.shortText;
            const district = findComp('sublocality') || findComp('administrative_area_level_3');
            const route = findComp('route');
            if (district) params.set('district', district); else params.delete('district');
            if (route) params.set('street', route); else params.delete('street');
            if (price[0] != null) params.set('priceMin', String(price[0])); else params.delete('priceMin');
            if (price[1] != null) params.set('priceMax', String(price[1])); else params.delete('priceMax');
            if (area[0] != null) params.set('areaMin', String(area[0])); else params.delete('areaMin');
            if (area[1] != null) params.set('areaMax', String(area[1])); else params.delete('areaMax');
            params.set('page','1');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
        >
          Szukaj
          <span className='bg-white text-black rounded-[6px] px-[10px] text-[12px]/[16px] font-medium'>
            {count ?? '—'}
          </span>
        </button>
      </div>
    </section>
  );
}


