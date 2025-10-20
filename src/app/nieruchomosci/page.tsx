import Image from 'next/image';
import { Suspense } from 'react';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import ListingRow from '@/components/listings/ListingRow';
import ListingsSection from './ListingsSection';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@prisma/client';
import { ListingApiResponse } from '@/types/api.types';
import SortSelect from './SortSelect';
import Pagination from '@/components/ui/pagination';
import SearchTabs from '@/components/search/SearchTabs';

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pageParam = typeof sp?.page === 'string' ? sp.page : Array.isArray(sp?.page) ? sp.page?.[0] : undefined;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const sortParamRaw = typeof sp?.sort === 'string' ? sp.sort : Array.isArray(sp?.sort) ? sp.sort?.[0] : undefined;
  const transitionParam = typeof sp?.transition === 'string' ? sp.transition : Array.isArray(sp?.transition) ? sp.transition?.[0] : undefined;
  const sortKey = (['newest','price-desc','price-asc','area-asc','area-desc'] as const).includes((sortParamRaw as any)) ? (sortParamRaw as any) : 'newest';
  const kindParamRaw = typeof sp?.kind === 'string' ? sp.kind : Array.isArray(sp?.kind) ? sp.kind?.[0] : undefined;
  const kind: 'sale' | 'rent' = kindParamRaw === 'rent' || kindParamRaw === 'sale' ? (kindParamRaw as 'sale' | 'rent') : 'sale';
  const cityParam = typeof sp?.city === 'string' ? sp.city : Array.isArray(sp?.city) ? sp.city?.[0] : undefined;
  const districtParam = typeof sp?.district === 'string' ? sp.district : Array.isArray(sp?.district) ? sp.district?.[0] : undefined;
  const streetParam = typeof sp?.street === 'string' ? sp.street : Array.isArray(sp?.street) ? sp.street?.[0] : undefined;
  const propertyTypeParam = typeof sp?.propertyType === 'string' ? sp.propertyType : Array.isArray(sp?.propertyType) ? sp.propertyType?.[0] : undefined;
  const priceMin = typeof sp?.priceMin === 'string' ? Number(sp.priceMin) : undefined;
  const priceMax = typeof sp?.priceMax === 'string' ? Number(sp.priceMax) : undefined;
  const areaMin = typeof sp?.areaMin === 'string' ? Number(sp.areaMin) : undefined;
  const areaMax = typeof sp?.areaMax === 'string' ? Number(sp.areaMax) : undefined;

  // Build base filters (only visible and active/closed)
  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: {
      in: [AsariStatus.Active, AsariStatus.Closed],
    },
  };

  // Filter by offer type based on selected tab (sale/rent)
  const offerTypeFilter = (() => {
    if (kind === 'rent') return { endsWith: 'Rental', mode: 'insensitive' } as Prisma.StringNullableFilter;
    if (kind === 'sale') return { endsWith: 'Sale', mode: 'insensitive' } as Prisma.StringNullableFilter;
    return undefined;
  })();

  if (offerTypeFilter) {
    (filters as any).offerType = offerTypeFilter;
  }

  // Optional location filters
  if (cityParam) {
    (filters as any).locationCity = { contains: cityParam, mode: 'insensitive' } as Prisma.StringFilter;
  }
  if (districtParam) {
    (filters as any).locationDistrict = { contains: districtParam, mode: 'insensitive' } as Prisma.StringNullableFilter;
  }
  if (streetParam) {
    (filters as any).locationStreet = { contains: streetParam, mode: 'insensitive' } as Prisma.StringNullableFilter;
  }

  // Optional property type mapping – try to infer from listingIdString codes
  if (propertyTypeParam && propertyTypeParam !== 'any') {
    const codeFilters: Prisma.ListingWhereInput[] = [];
    if (propertyTypeParam === 'mieszkanie') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OM' } as any });
    } else if (propertyTypeParam === 'dom') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OD' } as any });
    } else if (propertyTypeParam === 'dzialka') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OG' } as any });
    } else if (propertyTypeParam === 'lokal') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OL' } as any });
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'BL' } as any });
    }
    if (codeFilters.length) {
      (filters as any).OR = [
        ...(filters as any).OR ?? [],
        ...codeFilters,
      ];
    }
  }

  // Compute bounds for price/area based on current non-price filters (includes propertyType)
  const bounds = await prisma.listing.aggregate({
    where: filters,
    _min: { price: true, area: true },
    _max: { price: true, area: true },
  });

  // Apply numeric range filters (for actual listing query)
  if (!Number.isNaN(priceMin!) && priceMin != null) {
    (filters as any).price = { ...(filters as any).price, gte: priceMin } as Prisma.FloatNullableFilter;
  }
  if (!Number.isNaN(priceMax!) && priceMax != null) {
    (filters as any).price = { ...(filters as any).price, lte: priceMax } as Prisma.FloatNullableFilter;
  }
  if (!Number.isNaN(areaMin!) && areaMin != null) {
    (filters as any).area = { ...(filters as any).area, gte: areaMin } as Prisma.FloatNullableFilter;
  }
  if (!Number.isNaN(areaMax!) && areaMax != null) {
    (filters as any).area = { ...(filters as any).area, lte: areaMax } as Prisma.FloatNullableFilter;
  }

  const totalCount = await prisma.listing.count({ where: filters });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const listings: ListingApiResponse[] = [];

  return (
    <div>
      <div className='full-bleed relative h-[360px] md:h-[525px] overflow-hidden'>
        {/* Mobile: default object position */}
        <Image
          src='/hero-2.png'
          alt='Okładka nieruchomości'
          fill
          priority
          sizes='100vw'
          className='object-cover md:hidden'
        />
        {/* Desktop/tablet: shifted object position */}
        <Image
          src='/hero-2.png'
          alt='Okładka nieruchomości'
          fill
          priority
          sizes='100vw'
          className='object-cover hidden md:block'
          style={{ objectPosition: '50% -110px' }}
        />
        <div className='absolute inset-0 bg-[#00000080]' />
        <div className='absolute inset-0 z-10 flex items-center justify-center px-[60px]'>
          {/* <div className='text-center'>
            <h1 className='text-white text-4xl md:text-5xl font-extrabold'>
              Znajdź swoje miejsce z nami.
            </h1>
            <p className='mt-3 text-white text-lg md:text-xl'>
              Domy, mieszkania, działki, lokale - mamy to, czego szukasz.
            </p>
          </div> */}
        </div>
      </div>
      {/* Search tabs box */}
      <div className='max-w-[872px] mx-auto -mt-16 relative z-20 px-0'>
        <SearchTabs
          priceMin={typeof bounds._min.price === 'number' ? bounds._min.price : undefined}
          priceMax={typeof bounds._max.price === 'number' ? bounds._max.price : undefined}
          areaMin={typeof bounds._min.area === 'number' ? bounds._min.area : undefined}
          areaMax={typeof bounds._max.area === 'number' ? bounds._max.area : undefined}
        />
      </div>

      <Breadcrumbs className='my-6' />

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0'>
        <div>
          <h1 className='text-3xl md:text-[40px]/[48px] mt-6 md:mt-0 font-bold'>Oferty nieruchomości</h1>
          <p className='text-base/[24px] md:text-xl/[48px] font-medium text-gray-700'>
            <span className='text-green-primary font-bold'>
              {totalCount} nieruchomości
            </span>{' '}
            {kind === 'rent' ? 'na wynajem' : 'na sprzedaż'}
          </p>
        </div>
        <div className='flex items-center gap-3 self-stretch md:self-end order-2 md:order-none'>
          <Button
            variant='outlineContrast'
            size='icon'
            className='rounded-full !w-11 !h-11 '
          >
            <Map className='size-5' />
          </Button>
          <SortSelect current={sortKey} />
        </div>
      </div>

      <div id='listings' className='space-y-6 mt-14'>
        {/* Show skeleton only for sort transitions; skip for pagination for smoother feel */}
        {transitionParam === 'sort' ? (
          <Suspense
            key={`${currentPage}-${sortKey}-${cityParam ?? ''}-${districtParam ?? ''}-${streetParam ?? ''}-${propertyTypeParam ?? ''}-${priceMin ?? ''}-${priceMax ?? ''}-${areaMin ?? ''}-${areaMax ?? ''}`}
            fallback={
              <div className='space-y-6'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <article
                    key={i}
                    className='w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-6 animate-pulse'
                  >
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-[460px_minmax(0,1fr)]'>
                      <div className='rounded-xl h-[260px] bg-[#F4F4F4]' />
                      <div className='min-w-0 flex justify-between p-2 gap-[70px]'>
                        <div className='flex flex-col h-full w-full'>
                          <div className='flex items-center gap-2 mb-2'>
                            <div className='h-6 w-28 rounded-full bg-[#F4F4F4]' />
                            <div className='h-4 w-32 rounded bg-[#F4F4F4]' />
                          </div>
                          <div className='h-7 w-3/4 rounded bg-[#F4F4F4] mb-2' />
                          <div className='space-y-2'>
                            <div className='h-4 w-full rounded bg-[#F4F4F4]' />
                            <div className='h-4 w-5/6 rounded bg-[#F4F4F4]' />
                          </div>
                          <div className='mt-auto pt-3 flex flex-wrap items-center gap-6'>
                            <div className='h-4 w-20 rounded bg-[#F4F4F4]' />
                            <div className='h-4 w-16 rounded bg-[#F4F4F4]' />
                            <div className='h-4 w-16 rounded bg-[#F4F4F4]' />
                          </div>
                        </div>
                        <div className='hidden md:flex flex-col items-end justify-between'>
                          <div className='text-right ml-auto'>
                            <div className='h-4 w-24 rounded bg-[#F4F4F4] mb-2' />
                            <div className='h-7 w-36 rounded bg-[#F4F4F4]' />
                          </div>
                          <div className='h-10 w-36 rounded-xl bg-[#F4F4F4]' />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            }
          >
            <ListingsSection
              page={currentPage}
              sort={sortKey}
              kind={kind}
              city={cityParam}
              district={districtParam}
              street={streetParam}
              propertyType={propertyTypeParam as any}
              priceMin={priceMin}
              priceMax={priceMax}
              areaMin={areaMin}
              areaMax={areaMax}
            />
          </Suspense>
        ) : (
          // Pagination path: render directly, no skeleton fallback (quick enough)
          <ListingsSection
            page={currentPage}
            sort={sortKey}
            kind={kind}
            city={cityParam}
            district={districtParam}
            street={streetParam}
            propertyType={propertyTypeParam as any}
            priceMin={priceMin}
            priceMax={priceMax}
            areaMin={areaMin}
            areaMax={areaMax}
          />
        )}
      </div>

      <div className='mt-8 mb-14 flex justify-center'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hrefPrefix={`/nieruchomosci?sort=${sortKey}&kind=${kind}`
            + `${cityParam ? `&city=${encodeURIComponent(cityParam)}` : ''}`
            + `${districtParam ? `&district=${encodeURIComponent(districtParam)}` : ''}`
            + `${streetParam ? `&street=${encodeURIComponent(streetParam)}` : ''}`
            + `${propertyTypeParam ? `&propertyType=${encodeURIComponent(propertyTypeParam)}` : ''}`
            + `${priceMin != null && !Number.isNaN(priceMin) ? `&priceMin=${priceMin}` : ''}`
            + `${priceMax != null && !Number.isNaN(priceMax) ? `&priceMax=${priceMax}` : ''}`
            + `${areaMin != null && !Number.isNaN(areaMin) ? `&areaMin=${areaMin}` : ''}`
            + `${areaMax != null && !Number.isNaN(areaMax) ? `&areaMax=${areaMax}` : ''}`
            + `&page=`}
          hrefHash='listings'
          smoothScrollTargetId='listings'
        />
      </div>
    </div>
  );
}
