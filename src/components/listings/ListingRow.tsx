'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AgentBadge, { AGENT_NAME } from '@/components/ui/agentBadge';
import PhotoCarousel from '@/components/ui/photoCarousel';
import { type CarouselApi } from '@/components/ui/carousel';
import { formatPrice } from '@/lib/utils';
import { ListingApiResponse } from '@/types/api.types';
import { Home, Layers, MapPin, MoveUpRight, Star } from 'lucide-react';

type Props = {
  listing: ListingApiResponse;
};

export default function ListingRow({ listing }: Props) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const handler = () => setCurrentIndex(api.selectedScrollSnap());
    handler();
    api.on('select', handler);
    return () => {
      api.off('select', handler);
    };
  }, [api]);

  const totalSlides = listing.images.length;

  return (
    <article className='w-full max-w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] p-6'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[460px_minmax(0,1fr)]'>
        {/* Media */}
        <div className='relative rounded-xl overflow-hidden'>
          <PhotoCarousel
            images={listing.images}
            isReservation={false}
            isSpecial={false}
            overlayRoundedBottom
          ></PhotoCarousel>
        </div>

        {/* Content */}
        <div className='min-w-0 flex justify-between p-2'>
          <div>
            <div className='flex items-center gap-2 text-gray-500 text-sm mb-2'>
              <Image
                src='/agents/patryk.png'
                alt='Patryk'
                width={20}
                height={20}
                className='rounded-full'
              />
              <span>Patryk</span>
              <span>•</span>
              <span>dodał to ogłoszenie wczoraj</span>
            </div>

            <h3 className='text-[22px] md:text-[28px] font-extrabold leading-tight mb-2'>
              {listing.title}
            </h3>

            <p className='text-gray-600 text-sm md:text-base'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </p>

            <div className='mt-3 flex flex-wrap items-center gap-6 text-gray-700'>
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
              <div className='flex items-center gap-2'>
                <MapPin className='size-4 text-gray-600' />
                <span className='text-sm md:text-base'>
                  {listing.locationVoivodeship}
                </span>
              </div>
            </div>
          </div>

          <div className='mt-4 flex flex-col items-center justify-between'>
            <div className='text-right ml-auto mr-6 hidden md:block'>
              <div className='text-sm text-gray-500'>
                {formatPrice(Math.round(listing.pricePerM2 ?? 0))}/m²
              </div>
              <div className='text-green-primary font-black text-3xl'>
                {formatPrice(listing.price ?? 0)}
              </div>
            </div>

            <Button className='ml-auto'>Zobacz ofertę</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
