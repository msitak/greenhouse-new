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
// import { AreaRangeField } from '@/components/search/AreaRangeField';
import { DualRange } from '@/components/search/DualRange';
import type { RangeValue } from '@/lib/hooks/useRange';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// Helper: pull a specific address component text (long or short)
export function getAddressComponentText(
  comps:
    | Array<{ longText?: string; shortText?: string; types?: string[] }>
    | undefined,
  type: string
): string | undefined {
  if (!comps?.length) return undefined;
  const hit = comps.find(c => (c.types || []).includes(type));
  return hit?.longText || hit?.shortText || undefined;
}

// Helpers: URL param utilities with backwards-compatible aliases
function getParam(
  searchParams: ReturnType<typeof useSearchParams>,
  keys: string[]
) {
  for (const k of keys) {
    const v = searchParams?.get(k);
    if (v != null) return v;
  }
  return null;
}

function normalizeKind(value: string | null): 'sale' | 'rent' | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === 'sale' || v === 'rent') return v;
  if (v === 'sprzedaz') return 'sale';
  if (v === 'wynajem') return 'rent';
  return null;
}

// Helper: build query params from staged filters (KISS – one place to change)
export function buildQueryParams(args: {
  kind: 'sale' | 'rent';
  propertyType: string;
  location?: {
    label?: string | null;
    addressComponents?: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }>;
  };
  price: [number | null, number | null];
  area: [number | null, number | null];
}): URLSearchParams {
  const { kind, propertyType, location, price, area } = args;
  const params = new URLSearchParams();
  params.set('kind', kind);
  if (propertyType && propertyType !== 'any')
    params.set('propertyType', propertyType);

  const cityName = getAddressComponentText(
    location?.addressComponents,
    'locality'
  );
  if (cityName) {
    params.set('city', cityName);
  } else if (location?.label && !location.label.includes(',')) {
    // Fallback: if user typed a plain city name (no district/street), keep it
    params.set('city', location.label.trim());
  }
  const district =
    getAddressComponentText(location?.addressComponents, 'sublocality') ||
    getAddressComponentText(
      location?.addressComponents,
      'administrative_area_level_3'
    );
  const route = getAddressComponentText(location?.addressComponents, 'route');
  if (district) params.set('district', district);
  if (route) params.set('street', route);

  if (price[0] != null) params.set('priceMin', String(price[0]));
  if (price[1] != null) params.set('priceMax', String(price[1]));
  if (area[0] != null) params.set('areaMin', String(area[0]));
  if (area[1] != null) params.set('areaMax', String(area[1]));
  return params;
}

type SearchTabsProps = {
  className?: string;
  defaultValue?: 'sale' | 'rent';
  saleContent?: React.ReactNode;
  rentContent?: React.ReactNode;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  /** Optional path to navigate to on search, e.g. '/nieruchomosci' */
  redirectPath?: string;
};

export default function SearchTabs({
  className,
  defaultValue = 'sale',
  priceMin,
  priceMax,
  areaMin,
  areaMax,
  redirectPath,
}: SearchTabsProps) {
  type PropertyType = 'any' | 'mieszkanie' | 'dom' | 'dzialka' | 'lokal';
  const [filters, setFilters] = React.useState<{ propertyType: PropertyType }>({
    propertyType: 'any',
  });

  const handlePropertyTypeChange = (value: string) => {
    const v = (value as PropertyType) || 'any';
    setFilters(prev => ({ ...prev, propertyType: v }));
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine current tab from URL (supports legacy `transakcja` values)
  const currentKind = ((): 'sale' | 'rent' => {
    const raw = getParam(searchParams, ['kind', 'transakcja']);
    const normalized = normalizeKind(raw);
    return normalized ?? defaultValue;
  })();

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('kind', value);
    // reset pagination on tab change
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Location state synced with URL params (city + optional district)
  const initialCity = getParam(searchParams, ['city', 'miasto']) || '';
  const initialDistrict = searchParams?.get('district') || '';
  const initialStreet = searchParams?.get('street') || '';
  const initialLocationLabel = initialCity
    ? initialStreet
      ? `${initialStreet}, ${initialDistrict || initialCity}`
      : initialDistrict
        ? `${initialDistrict}, ${initialCity}`
        : initialCity
    : '';
  const [location, setLocation] = React.useState<LocationValue | undefined>(
    initialLocationLabel
      ? { label: initialLocationLabel, placeId: '', lat: 0, lng: 0 }
      : undefined
  );

  const onLocationChange = (loc: LocationValue | undefined) => {
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
    parseNum(getParam(searchParams, ['priceMin', 'cenaMin'])),
    parseNum(getParam(searchParams, ['priceMax', 'cenaMax'])),
  ]);
  const [area, setArea] = React.useState<RangeValue>([
    parseNum(getParam(searchParams, ['areaMin', 'powierzchniaMin'])),
    parseNum(getParam(searchParams, ['areaMax', 'powierzchniaMax'])),
  ]);

  // dynamic bounds state; start with server-provided defaults
  const [bounds, setBounds] = React.useState({
    minPrice: priceMin ?? 0,
    maxPrice: priceMax ?? (currentKind === 'rent' ? 20000 : 2000000),
    minArea: areaMin ?? 0,
    maxArea: areaMax ?? 1000,
  });

  // URL updates only on "Szukaj" button; keep a no-op to satisfy handlers
  const updateUrlRange = () => {
    // intentionally no-op to avoid live URL churn
  };

  // Live count fetcher (updates with all staged inputs including ranges)
  const [count, setCount] = React.useState<number | null>(null);
  const [loadingBounds, setLoadingBounds] = React.useState(false);
  const [loadingCount, setLoadingCount] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const params = buildQueryParams({
      kind: currentKind,
      propertyType: filters.propertyType,
      location,
      price,
      area,
    });
    setLoadingCount(true);
    fetch(`/api/listings/count?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(d => setCount(typeof d?.count === 'number' ? d.count : 0))
      .catch(() => setCount(null))
      .finally(() => setLoadingCount(false));
    return () => controller.abort();
  }, [currentKind, filters.propertyType, location, price, area]);

  // Bounds fetcher (updates only when dataset changes: kind, propertyType, location)
  React.useEffect(() => {
    const controller = new AbortController();
    const params = buildQueryParams({
      kind: currentKind,
      propertyType: filters.propertyType,
      location,
      price: [null, null],
      area: [null, null],
    });
    setLoadingBounds(true);
    fetch(`/api/listings/bounds?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(d => {
        setBounds({
          minPrice: typeof d?.minPrice === 'number' ? d.minPrice : 0,
          maxPrice:
            typeof d?.maxPrice === 'number'
              ? d.maxPrice
              : currentKind === 'rent'
                ? 20000
                : 2000000,
          minArea: typeof d?.minArea === 'number' ? d.minArea : 0,
          maxArea: typeof d?.maxArea === 'number' ? d.maxArea : 1000,
        });
      })
      .catch(() => void 0)
      .finally(() => setLoadingBounds(false));
    return () => controller.abort();
  }, [currentKind, filters.propertyType, location]);

  // Keep inputs in sync with URL params (best practice: single source of truth)
  React.useEffect(() => {
    // Property type
    const pt = getParam(searchParams, ['propertyType', 'typ']);
    const nextPropertyType: PropertyType =
      pt === 'mieszkanie' || pt === 'dom' || pt === 'dzialka' || pt === 'lokal'
        ? pt
        : 'any';
    if (filters.propertyType !== nextPropertyType) {
      setFilters({ propertyType: nextPropertyType });
    }

    // Location label from URL: prefer "district, city" when available
    const city = getParam(searchParams, ['city', 'miasto']) || '';
    const district = searchParams?.get('district') || '';
    const street = searchParams?.get('street') || '';
    const urlLabel = city
      ? street
        ? `${street}, ${district || city}`
        : district
          ? `${district}, ${city}`
          : city
      : '';
    const nextLocation = urlLabel
      ? { label: urlLabel, placeId: '', lat: 0, lng: 0 }
      : undefined;
    const currentLabel = location?.label || '';
    if ((nextLocation?.label || '') !== currentLabel) {
      setLocation(nextLocation);
    }

    // Price range
    const pMin = parseNum(getParam(searchParams, ['priceMin', 'cenaMin']));
    const pMax = parseNum(getParam(searchParams, ['priceMax', 'cenaMax']));
    if (price[0] !== pMin || price[1] !== pMax) {
      setPrice([pMin, pMax]);
    }

    // Area range
    const aMin = parseNum(
      getParam(searchParams, ['areaMin', 'powierzchniaMin'])
    );
    const aMax = parseNum(
      getParam(searchParams, ['areaMax', 'powierzchniaMax'])
    );
    if (area[0] !== aMin || area[1] !== aMax) {
      setArea([aMin, aMax]);
    }
    // We intentionally do not modify bounds here; they are fetched separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // const clearLocation = () => {
  //   setLocation(undefined);
  //   const params = new URLSearchParams(searchParams?.toString() || '');
  //   params.delete('city');
  //   params.set('page', '1');
  //   router.push(`${pathname}?${params.toString()}`);
  // };

  return (
    <section
      className={cn(
        'rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]',
        className
      )}
    >
      {/** spacer for potential notices; remove no-op node causing linter error */}
      <Tabs value={currentKind} onValueChange={onTabChange}>
        <TabsList className='grid grid-cols-2 w-full px-0 gap-0'>
          <TabsTrigger value='sale'>Sprzedaż</TabsTrigger>
          <TabsTrigger value='rent'>Wynajem</TabsTrigger>
        </TabsList>
        <TabsContent value='sale'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
            <div className='flex flex-col gap-2'>
              <Label>Typ nieruchomości</Label>
              <Select
                value={
                  filters.propertyType === 'any' ? 'any' : filters.propertyType
                }
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className='rounded-xl bg-[#F7F7F7] md:bg-white border-0 md:border md:border-[#CCCCCC] text-[#6E6E6E] font-normal md:font-medium w-full px-3 h-11 md:h-auto md:px-4 md:py-3 text-sm cursor-pointer'>
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
                <LocationCombobox
                  value={location}
                  onChange={onLocationChange}
                  placeholder='miasto, dzielnica'
                />
              </div>
            </div>
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {loadingBounds ? (
                  <div className='relative' aria-busy>
                    {/* Reserve exact layout by rendering invisible control */}
                    <div className='opacity-0 pointer-events-none'>
                      <PriceRangeField
                        id='price-sale-hidden'
                        dealType='sale'
                        min={bounds.minPrice}
                        max={bounds.maxPrice}
                        value={price}
                        onChange={() => {}}
                      />
                    </div>
                    {/* Skeleton overlay roughly matching inner elements */}
                    <div className='absolute inset-0 flex flex-col gap-2'>
                      <Skeleton className='h-4 w-28 rounded self-start' />
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                        <span className='text-muted-foreground'>–</span>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                      </div>
                      <Skeleton className='h-[6px] w-full rounded' />
                    </div>
                  </div>
                ) : (
                  <PriceRangeField
                    id='price-sale'
                    dealType='sale'
                    min={bounds.minPrice}
                    max={bounds.maxPrice}
                    value={price}
                    onChange={v => {
                      setPrice(v);
                      updateUrlRange();
                    }}
                  />
                )}
                {loadingBounds ? (
                  <div className='relative' aria-busy>
                    <div className='opacity-0 pointer-events-none'>
                      <DualRange
                        id='area-hidden'
                        label='Powierzchnia'
                        unit='m²'
                        min={bounds.minArea}
                        max={bounds.maxArea}
                        step={1}
                        value={area}
                        onChange={() => {}}
                        minDistance={1}
                        updateStrategy='throttle'
                      />
                    </div>
                    <div className='absolute inset-0 flex flex-col gap-2'>
                      <Skeleton className='h-4 w-32 rounded self-start' />
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                        <span className='text-muted-foreground'>–</span>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                      </div>
                      <Skeleton className='h-[6px] w-full rounded' />
                    </div>
                  </div>
                ) : (
                  <DualRange
                    id='area'
                    label='Powierzchnia'
                    unit='m²'
                    min={bounds.minArea}
                    max={bounds.maxArea}
                    step={1}
                    value={area}
                    onChange={v => {
                      // Called on commit when updateStrategy='commit'
                      setArea(v);
                      updateUrlRange();
                    }}
                    minDistance={1}
                    updateStrategy='commit'
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='rent'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
            <div className='flex flex-col gap-2'>
              <Label>Typ nieruchomości</Label>
              <Select
                value={
                  filters.propertyType === 'any' ? 'any' : filters.propertyType
                }
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger className='rounded-xl bg-[#F7F7F7] md:bg-white border-0 md:border md:border-[#CCCCCC] text-[#6E6E6E] font-normal md:font-medium w-full px-3 h-11 md:h-auto md:px-4 md:py-3 text-sm cursor-pointer'>
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
                <LocationCombobox
                  value={location}
                  onChange={onLocationChange}
                  placeholder='np. Katowice, Raków'
                />
              </div>
            </div>
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {loadingBounds ? (
                  <div className='relative' aria-busy>
                    <div className='opacity-0 pointer-events-none'>
                      <PriceRangeField
                        id='price-rent-hidden'
                        dealType='rent'
                        min={bounds.minPrice}
                        max={bounds.maxPrice}
                        value={price}
                        onChange={() => {}}
                      />
                    </div>
                    <div className='absolute inset-0 flex flex-col gap-2'>
                      <Skeleton className='h-4 w-28 rounded self-start' />
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                        <span className='text-muted-foreground'>–</span>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                      </div>
                      <Skeleton className='h-[6px] w-full rounded' />
                    </div>
                  </div>
                ) : (
                  <PriceRangeField
                    id='price-rent'
                    dealType='rent'
                    min={bounds.minPrice}
                    max={bounds.maxPrice}
                    value={price}
                    onChange={v => {
                      setPrice(v);
                      updateUrlRange();
                    }}
                  />
                )}
                {loadingBounds ? (
                  <div className='relative' aria-busy>
                    <div className='opacity-0 pointer-events-none'>
                      <DualRange
                        id='area-rent-hidden'
                        label='Powierzchnia'
                        unit='m²'
                        min={bounds.minArea}
                        max={bounds.maxArea}
                        step={1}
                        value={area}
                        onChange={() => {}}
                        minDistance={1}
                        updateStrategy='throttle'
                      />
                    </div>
                    <div className='absolute inset-0 flex flex-col gap-2'>
                      <Skeleton className='h-4 w-32 rounded self-start' />
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                        <span className='text-muted-foreground'>–</span>
                        <div className='flex items-center gap-1'>
                          <Skeleton className='h-7 w-28 rounded-md' />
                          <Skeleton className='h-3 w-6 rounded' />
                        </div>
                      </div>
                      <Skeleton className='h-[6px] w-full rounded' />
                    </div>
                  </div>
                ) : (
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
                      updateUrlRange();
                    }}
                    minDistance={1}
                    updateStrategy='commit'
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className='flex items-center justify-between px-6 pb-4'>
        <button
          type='button'
          className={cn(
            'flex items-center gap-2 text-xs font-semibold hover:bg-[#00000006] py-4 px-8 rounded-xl cursor-pointer hidden md:block',
            !(
              filters.propertyType !== 'any' ||
              !!location ||
              price[0] != null ||
              price[1] != null ||
              area[0] != null ||
              area[1] != null
            )
              ? 'invisible pointer-events-none'
              : ''
          )}
          onClick={() => {
            // Clear staged state
            setLocation(undefined);
            setPrice([null, null]);
            setArea([null, null]);
            setFilters({ propertyType: 'any' });
            // Clear URL filters without navigating/scrolling
            const params = new URLSearchParams(searchParams?.toString() || '');
            [
              'city',
              'district',
              'street',
              'priceMin',
              'priceMax',
              'areaMin',
              'areaMax',
              'propertyType',
              'page',
            ].forEach(k => params.delete(k));
            router.replace(`${pathname}?${params.toString()}`, {
              scroll: false,
            });
          }}
        >
          Wyczyść kryteria
          <span aria-hidden> ×</span>
        </button>

        <button
          type='button'
          className='bg-green-primary text-white rounded-[8px] px-6 py-4 text-sm/[20px] font-semibold flex items-center gap-3 cursor-pointer hover:bg-[#76B837] w-full md:w-auto justify-center'
          onClick={() => {
            const params = buildQueryParams({
              kind: currentKind,
              propertyType: filters.propertyType,
              location,
              price,
              area,
            });
            params.set('page', '1');
            const targetPath = redirectPath || pathname;
            if (redirectPath && redirectPath !== pathname) {
              router.push(`${targetPath}?${params.toString()}`, {
                scroll: true,
              });
            } else {
              router.replace(`${targetPath}?${params.toString()}`, {
                scroll: false,
              });
            }
          }}
        >
          Szukaj
          <span className='bg-white text-black rounded-[6px] px-[10px] text-[12px]/[16px] font-medium min-w-[28px] grid place-items-center'>
            {loadingCount ? '' : (count ?? '')}
          </span>
        </button>
      </div>
    </section>
  );
}
