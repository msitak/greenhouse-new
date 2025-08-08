import React from 'react';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import AgentBadge, { AGENT_NAME } from '../ui/agentBadge';

import { mockedOffer } from '@/app/api/test-offer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../ui/carousel';
import { formatPrice } from '@/lib/utils';

const OfferTile = ({ offer = mockedOffer }) => {
  return (
    <div className='relative rounded-xl w-fit shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
      <Carousel className='w-[424px]'>
        <CarouselContent>
          {offer.images.map((image, index) => (
            <CarouselItem key={index}>
              <Image
                className='rounded-t-xl'
                src={image.urlNormal}
                alt={`offer image ${index + 1}`}
                width={424}
                height={239}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-3' />
        <CarouselNext className='right-3' />
      </Carousel>
      <AgentBadge
        className='absolute top-3 left-3'
        agentName={AGENT_NAME.PATRYK}
      />
      <div className='p-4'>
        <p className='font-medium text-base mb-4'>{`${offer.locationStreet}, ${offer.locationCity}`}</p>
        <div className='flex gap-4 mb-4'>
          <span>{offer.roomsCount} pokoje</span>
          <span>{offer.area} m²</span>
          <span>{offer.floor} piętro</span>
        </div>
        <Separator color='#F4F4F4' className='h-6' />
        <h2 className='font-black text-2xl my-4 text-green-primary'>
          {formatPrice(offer.price)}
        </h2>
      </div>
    </div>
  );
};

export default OfferTile;
