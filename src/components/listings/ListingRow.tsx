import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { generateListingSlug } from '@/lib/utils';
import PhotoCarousel from '@/components/ui/photoCarousel';
import AgentBadge, { AGENT_NAME } from '@/components/ui/agentBadge';
import { formatAddedByAgentAgo } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { ListingApiResponse } from '@/types/api.types';
import { Home, Layers, MoveUpRight } from 'lucide-react';

type Props = {
  listing: ListingApiResponse;
  agentBadgeClassName?: string;
  isReservation?: boolean;
  isSpecial?: boolean;
};

export default function ListingRow({
  listing,
  agentBadgeClassName,
  isReservation = false,
  isSpecial = false,
}: Props) {
  const formatAddedAgo = (dateStr?: string | null, agentFullName?: string | null) =>
    formatAddedByAgentAgo(dateStr, agentFullName);
  return (
    <article className='w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-6'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[460px_minmax(0,1fr)]'>
        {/* Media */}
        <div className='relative rounded-xl h-[260px] overflow-hidden'>
          <PhotoCarousel
            images={listing.images}
            isReservation={isReservation}
            isSpecial={isSpecial}
            imageClassName='h-[260px]'
            overlayRoundedBottom
          />
        </div>

        {/* Content */}
        <div className='min-w-0 flex justify-between p-2 gap-[70px]'>
          <div className='flex flex-col h-full'>
            <div className='flex items-center gap-2 text-gray-500 text-sm mb-2'>
              <AgentBadge
                name={listing.agentName ? listing.agentName.split(' ')[0] : undefined}
                fullNameForImage={listing.agentName ?? undefined}
                placement='listing'
                className={agentBadgeClassName ?? ''}
              />
              {listing.createdAtSystem && (
                <span>{formatAddedAgo(listing.createdAtSystem, listing.agentName)}</span>
              )}
            </div>

            <h3 className='text-2xl font-extrabold leading-tight mb-2'>
              {listing.title}
            </h3>

            <p className='text-gray-600 text-sm'>
              {listing.privateDescription}
            </p>

            <div className='mt-auto pt-3 flex flex-wrap items-center gap-6 text-gray-700'>
              {listing.roomsCount ? (
                <div className='flex items-center gap-2'>
                  <Home className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>
                    {listing.roomsCount} {listing.roomsCount === 1 ? 'pokój' : 'pokoje'}
                  </span>
                </div>
              ) : null}
              {listing.area ? (
                <div className='flex items-center gap-2'>
                  <MoveUpRight className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>{listing.area} m²</span>
                </div>
              ) : null}
              {typeof listing.floor === 'number' ? (
                <div className='flex items-center gap-2'>
                  <Layers className='size-4 text-gray-600' />
                  <span className='text-sm md:text-base'>
                    {listing.floor === 0 ? 'parter' : `${listing.floor}/${listing.floorCount ?? '—'} piętro`}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className='flex flex-col items-end justify-between'>
            <div className='text-right ml-auto hidden md:block'>
              {!(listing.offerType && listing.offerType.toLowerCase().includes('rent')) && (
                <div className='text-lg text-gray-500'>
                  {formatPrice(Math.round(listing.pricePerM2 ?? 0))}/m²
                </div>
              )}
              <div className='text-green-primary font-black text-3xl'>
                {formatPrice(listing.price ?? 0)}
              </div>
            </div>

            <Link
              href={`/nieruchomosci/${listing.slug ?? generateListingSlug({
                asariId: listing.asariId as unknown as number,
                listingIdString: (listing as any).additionalDetailsJson?.listingIdString ?? null,
                roomsCount: listing.roomsCount ?? undefined,
                offerType: listing.offerType ?? undefined,
                locationCity: listing.locationCity ?? undefined,
                locationDistrict: (listing as any).locationDistrict ?? undefined,
              })}`}
              className='ml-auto'
            >
              <Button className='bg-black hover:bg-[#343434]'>Zobacz ofertę</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
