'use client';

import React from 'react';
import Image from 'next/image';
import AgentBadge, { AGENT_NAME } from '../ui/agentBadge';
import { Separator } from '../ui/separator';

import { mockedOffer } from '@/app/api/test-offer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  type CarouselApi,
} from '../ui/carousel';
import { formatPrice } from '@/lib/utils';
import { ChevronRight, Layers, MapPin, Home, MoveUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfferTile = ({ offer = mockedOffer }) => {
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

  const totalSlides = offer.images.length;

  return (
    <div className='relative rounded-2xl w-fit overflow-hidden bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
      <Carousel className='w-fit' setApi={setApi}>
        <CarouselContent>
          {offer.images.map((image, index) => (
            <CarouselItem key={index}>
              <Image
                className='rounded-t-2xl'
                src={image.urlNormal}
                alt={`offer image ${index + 1}`}
                width={424}
                height={239}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <AgentBadge
          className='absolute top-3 left-3'
          agentName={AGENT_NAME.PATRYK}
        />

        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[36px] bg-[#00000026] backdrop-blur-sm bg-gradient-to-t from-black/55 to-black/0' />

        <div className='absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2 text-white'>
          <span className='flex items-baseline gap-0.5'>
            <span className='text-sm font-medium'>{currentIndex + 1}</span>
            <span className='text-xs font-normal'>/{totalSlides}</span>
          </span>
          <div className='flex items-center gap-1.5 mx-auto'>
            {offer.images.map((_, index) => (
              <button
                type='button'
                key={index}
                aria-label={`Przejdź do slajdu ${index + 1}`}
                aria-current={index === currentIndex}
                onClick={() => api?.scrollTo(index)}
                className={`rounded-full cursor-pointer outline-none focus-visible:ring-[2px] focus-visible:ring-white/60 ${
                  index === currentIndex
                    ? 'h-1.5 w-1.5 bg-green-primary'
                    : 'h-1 w-1 bg-white/70'
                }`}
              />
            ))}
          </div>
          <CarouselNext className='pointer-events-auto right-1.5 bottom-1.5 top-auto -translate-y-0 hover:bg-white hover:text-[#1E1E1E]' />
        </div>
      </Carousel>

      <div className='p-4 relative'>
        <p className='font-medium text-base mb-3 flex items-center gap-2 text-gray-900'>
          <MapPin className='size-4 text-gray-700' />
          {`${offer.locationStreet}, ${offer.locationCity}`}
        </p>

        <div className='flex gap-6 mb-3 text-gray-700'>
          <div className='flex items-center gap-2'>
            <Home className='size-4 text-gray-600' />
            <span className='text-base'>{offer.roomsCount} pokoje</span>
          </div>
          <div className='flex items-center gap-2'>
            <MoveUpRight className='size-4 text-gray-600' />
            <span className='text-base'>{offer.area} m²</span>
          </div>
          <div className='flex items-center gap-2'>
            <Layers className='size-4 text-gray-600' />
            <span className='text-base'>{offer.floor} piętro</span>
          </div>
        </div>

        <Separator className='bg-[#F4F4F4] my-2' />

        <div className='flex items-center justify-between pt-2'>
          <div className='flex items-baseline gap-3'>
            <h2 className='font-black text-2xl text-green-primary leading-none'>
              {formatPrice(offer.price)}
            </h2>
          </div>

          <Button
            variant='outline'
            size='icon'
            className='size-8 rounded border border-[#00000026] text-[#1E1E1E] hover:bg-white hover:text-[#1E1E1E] hover:border-[#00000026]'
          >
            <ChevronRight className='size-6 text-[#1E1E1E]' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfferTile;
