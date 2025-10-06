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

const PAGE_SIZE = 10;

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: PageProps) {
  const pageParam = typeof searchParams?.page === 'string' ? searchParams?.page : Array.isArray(searchParams?.page) ? searchParams?.page?.[0] : undefined;
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const sortParamRaw = typeof searchParams?.sort === 'string' ? searchParams?.sort : Array.isArray(searchParams?.sort) ? searchParams?.sort?.[0] : undefined;
  const transitionParam = typeof searchParams?.transition === 'string' ? searchParams?.transition : Array.isArray(searchParams?.transition) ? searchParams?.transition?.[0] : undefined;
  const sortKey = (['newest','price-desc','price-asc','area-asc','area-desc'] as const).includes((sortParamRaw as any)) ? (sortParamRaw as any) : 'newest';

  // Build base filters (only visible and active/closed)
  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: {
      in: [AsariStatus.Active, AsariStatus.Closed],
    },
  };

  const totalCount = await prisma.listing.count({ where: filters });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const listings: ListingApiResponse[] = [];

  return (
    <div>
      <div className='full-bleed relative h-[525px] overflow-hidden'>
        <Image
          src='/hero-2.png'
          alt='Okładka nieruchomości'
          fill
          priority
          sizes='100vw'
          className='object-cover'
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
      <Breadcrumbs className='my-6' />

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-[40px]/[48px] font-bold'>Oferty nieruchomości</h1>
          <p className='text-xl/[48px] text-gray-700'>
            <span className='text-green-primary font-bold'>
              {totalCount} nieruchomości
            </span>{' '}
            na sprzedaż
          </p>
        </div>
        <div className='flex items-center gap-3 self-end'>
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
            key={`${currentPage}-${sortKey}`}
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
            {/* @ts-expect-error Async Server Component */}
            <ListingsSection page={currentPage} sort={sortKey} />
          </Suspense>
        ) : (
          // Pagination path: render directly, no skeleton fallback (quick enough)
          // @ts-expect-error Async Server Component
          <ListingsSection page={currentPage} sort={sortKey} />
        )}
      </div>

      <div className='mt-8 mb-14 flex justify-center'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hrefPrefix={`/nieruchomosci?sort=${sortKey}&page=`}
          hrefHash='listings'
          smoothScrollTargetId='listings'
        />
      </div>
    </div>
  );
}
