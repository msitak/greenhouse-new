import { Button } from '@/components/ui/button';
import PhotoCarousel from '@/components/ui/photoCarousel';
import AgentBadge, { AGENT_NAME } from '@/components/ui/agentBadge';
import { formatPrice } from '@/lib/utils';
import { ListingApiResponse } from '@/types/api.types';
import { Home, Layers, MapPin, MoveUpRight } from 'lucide-react';

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
  return (
    <article className='w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-6'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[460px_minmax(0,1fr)]'>
        {/* Media */}
        <div className='relative rounded-xl overflow-hidden'>
          <PhotoCarousel
            images={listing.images}
            isReservation={isReservation}
            isSpecial={isSpecial}
            overlayRoundedBottom
          ></PhotoCarousel>
        </div>

        {/* Content */}
        <div className='min-w-0 flex justify-between p-2 gap-[70px]'>
          <div className='flex flex-col h-full'>
            <div className='flex items-center gap-2 text-gray-500 text-sm mb-2'>
              <AgentBadge
                agentName={AGENT_NAME.PATRYK}
                placement='listing'
                className={agentBadgeClassName ?? ''}
              />
              <span>dodał to ogłoszenie wczoraj</span>
            </div>

            <h3 className='text-2xl font-extrabold leading-tight mb-2'>
              {listing.title}
            </h3>

            <p className='text-gray-600 text-sm'>
              {listing.addToDescriptionInExport}
            </p>

            <div className='mt-auto pt-3 flex flex-wrap items-center gap-6 text-gray-700'>
              <div className='flex items-center gap-2'>
                <Home className='size-4 text-gray-600' />
                <span className='text-sm md:text-base'>
                  {listing.roomsCount} pokoje
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <MoveUpRight className='size-4 text-gray-600' />
                <span className='text-sm md:text-base'>{listing.area} m²</span>
              </div>
              <div className='flex items-center gap-2'>
                <Layers className='size-4 text-gray-600' />
                <span className='text-sm md:text-base'>
                  {listing.floor} piętro
                </span>
              </div>
            </div>
          </div>

          <div className='flex flex-col items-end justify-between'>
            <div className='text-right ml-auto hidden md:block'>
              <div className='text-lg text-gray-500'>
                {formatPrice(Math.round(listing.pricePerM2 ?? 0))}/m²
              </div>
              <div className='text-green-primary font-black text-3xl'>
                {formatPrice(listing.price ?? 0)}
              </div>
            </div>

            <Button className='ml-auto bg-black hover:bg-[#343434]'>
              Zobacz ofertę
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
