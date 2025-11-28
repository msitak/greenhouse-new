import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateListingSlug } from '@/lib/utils';
import PhotoCarousel from '@/components/ui/photoCarousel';
import AgentBadge from '@/components/ui/agentBadge';
import { formatAddedByAgentAgo } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { ListingApiResponse } from '@/types/api.types';
import { ChevronRight, Home, Layers, MoveUpRight } from 'lucide-react';
import { Separator } from '../ui/separator';

type Props = {
  listing: ListingApiResponse;
  agentBadgeClassName?: string;
  isReservation?: boolean;
  isSpecial?: boolean;
  priority?: boolean;
};

// Helper function to determine property type
// Priority: 1) offerType (most reliable), 2) listingIdString parsing (fallback)
function getPropertyTypeFromListing(
  listing: ListingApiResponse
): string | null {
  // 1. Try mapping from offerType (most reliable source)
  if (listing.offerType) {
    const type = listing.offerType.toLowerCase();
    if (type.includes('apartment')) return 'Mieszkanie';
    if (type.includes('house')) return 'Dom';
    if (type.includes('lot')) return 'Działka';
    if (type.includes('commercial')) return 'Lokal';
    if (type.includes('garage')) return 'Garaż';
    if (type.includes('warehouse')) return 'Hala';
    if (type.includes('office')) return 'Biuro';
    if (type.includes('room')) return 'Pokój';
  }

  // 2. Fallback: Try parsing listingIdString
  if (
    listing.additionalDetailsJson &&
    typeof listing.additionalDetailsJson === 'object'
  ) {
    const listingIdString = (
      listing.additionalDetailsJson as { listingIdString?: string }
    ).listingIdString;

    if (listingIdString && typeof listingIdString === 'string') {
      const parts = listingIdString.split('/');
      const code = parts[parts.length - 1];

      if (code.includes('OM')) return 'Mieszkanie';
      if (code.includes('OD')) return 'Dom';
      if (code.includes('OG')) return 'Działka';
      if (code.includes('OL') || code.includes('BL')) return 'Lokal';
    }
  }

  return null;
}

export default function ListingRow({
  listing,
  agentBadgeClassName,
  isReservation = false,
  isSpecial = false,
  priority = false,
}: Props) {
  const formatAddedAgo = (
    dateStr?: string | null,
    agentFullName?: string | null
  ) => formatAddedByAgentAgo(dateStr, agentFullName);
  const addedTextBase = listing.createdAtSystem
    ? formatAddedAgo(listing.createdAtSystem, listing.agentName)
    : '';
  const addedTextMobile = addedTextBase.replace('to ogłoszenie', 'tę ofertę');
  const detailHref = `/nieruchomosci/${
    listing.slug ??
    generateListingSlug({
      asariId: Number(listing.asariId),
      listingIdString:
        (
          (listing as unknown as {
            additionalDetailsJson?: { listingIdString?: string | null };
          }) || {}
        ).additionalDetailsJson?.listingIdString ?? null,
      roomsCount: listing.roomsCount ?? undefined,
      offerType: listing.offerType ?? undefined,
      locationCity: listing.locationCity ?? undefined,
      locationDistrict:
        ((listing as unknown as { locationDistrict?: string | null }) || {})
          .locationDistrict ?? undefined,
    })
  }`;

  // Construct formatted title: "PropertyType, Street, City"
  const propertyType =
    getPropertyTypeFromListing(listing) ||
    (listing.propertyTypeId === 1
      ? 'Mieszkanie' // Fallback basic mapping if propertyTypeId is available and consistent
      : 'Nieruchomość');

  const street = listing.locationStreet ? `ul. ${listing.locationStreet}` : '';
  const city = listing.locationCity ?? '';

  const formattedTitle = [propertyType, street, city]
    .filter(Boolean)
    .join(', ');

  return (
    <article className='w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-4 md:p-6'>
      <div className='grid grid-cols-1 md:gap-10 lg:grid-cols-[460px_minmax(0,1fr)]'>
        {/* Media */}
        <div className='relative rounded-xl h-[260px] overflow-hidden -m-[16px] md:m-0'>
          <PhotoCarousel
            images={listing.images}
            isReservation={isReservation}
            isSpecial={isSpecial}
            imageClassName='h-[260px]'
            overlayRoundedBottom
            priority={priority}
            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 460px'
          />
        </div>

        {/* Content */}
        <div className='min-w-0 flex justify-between mt-4 md:mt-0 gap-0 md:gap-[70px]'>
          <div className='flex flex-col h-full'>
            <div className='flex items-center gap-2 text-gray-500 text-sm mb-2 rounded-full px-0 mt-4 md:mt-0 md:bg-transparent md:rounded-none md:px-0 md:py-0'>
              <AgentBadge
                name={
                  listing.agentName
                    ? listing.agentName.split(' ')[0]
                    : undefined
                }
                fullNameForImage={listing.agentName ?? undefined}
                placement='listing'
                className={agentBadgeClassName ?? ''}
              />
              {listing.createdAtSystem && (
                <>
                  <span className='hidden md:inline'>{addedTextBase}</span>
                  <span className='md:hidden'>{addedTextMobile}</span>
                </>
              )}
            </div>

            <h3 className='text-2xl font-semibold leading-tight mb-2'>
              {formattedTitle}
            </h3>

            <p className='text-gray-600 text-sm'>{listing.aiSummary}</p>

            <div className='mt-auto pt-3 flex flex-wrap items-center gap-6 text-gray-700'>
              {listing.roomsCount ? (
                <div className='flex items-center gap-2'>
                  <Home className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>
                    {listing.roomsCount}{' '}
                    {listing.roomsCount === 1 ? 'pokój' : 'pokoje'}
                  </span>
                </div>
              ) : null}
              {listing.area ? (
                <div className='flex items-center gap-2'>
                  <MoveUpRight className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>
                    {listing.area} m²
                  </span>
                </div>
              ) : null}
              {typeof listing.floor === 'number' ? (
                <div className='flex items-center gap-2'>
                  <Layers className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>
                    {listing.floor === 0
                      ? 'parter'
                      : `${listing.floor}/${listing.floorCount ?? '—'} piętro`}
                  </span>
                </div>
              ) : null}
            </div>

            <Separator className='mt-4 mb-3 md:hidden' />

            {/* Mobile-only price and arrow action */}
            <div className='flex items-center justify-between md:hidden'>
              <div className='text-green-primary font-black text-3xl'>
                {formatPrice(listing.price ?? 0)}
              </div>
              <Link href={detailHref} className='ml-4'>
                <Button
                  variant='arrow'
                  size='icon'
                  className='border border-[#00000026] w-8 h-8 rounded-md'
                >
                  <ChevronRight className='size-6 text-[#1E1E1E]' />
                </Button>
              </Link>
            </div>
          </div>

          <div className='flex flex-col items-end justify-between'>
            <div className='text-right ml-auto hidden md:block'>
              {!(
                listing.offerType &&
                listing.offerType.toLowerCase().includes('rent')
              ) && (
                <div className='text-lg text-gray-500'>
                  {formatPrice(Math.round(listing.pricePerM2 ?? 0))}/m²
                </div>
              )}
              <div className='text-green-primary font-black text-3xl'>
                {formatPrice(listing.price ?? 0)}
              </div>
            </div>

            <Link href={detailHref} className='ml-auto hidden md:block'>
              <Button className='bg-black hover:bg-[#343434]'>
                Zobacz ofertę
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
