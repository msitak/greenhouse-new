'use client';

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ListingImageApiResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

type PhotoCarouselProps = {
  images: ListingImageApiResponse[];
  className?: string;
  imageClassName?: string;
  isReservation?: boolean;
  isSpecial?: boolean;
  overlayRoundedBottom?: boolean;
  children?: React.ReactNode; // custom overlays (e.g., AgentBadge, Favorite)
};

export default function PhotoCarousel({
  images,
  className,
  imageClassName,
  isReservation = false,
  isSpecial = false,
  overlayRoundedBottom = true,
  children,
}: PhotoCarouselProps) {
  const safeImages = images?.length
    ? images
    : [
        {
          // fallback
          id: 'placeholder',
          asariId: null as unknown as number,
          urlNormal: '/test-image.jpg',
          urlThumbnail: '/test-image.jpg',
          description: null,
          order: null,
          dbCreatedAt: null as unknown as string,
          dbUpdatedAt: null as unknown as string,
        } as unknown as ListingImageApiResponse,
      ];

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

  const totalSlides = safeImages.length;

  return (
    <div
      className={cn('relative rounded-xl overflow-hidden bg-white', className)}
    >
      <Carousel
        className='w-full'
        setApi={setApi}
        disableKeyboard={isReservation}
      >
        <CarouselContent
          viewportClassName={isReservation ? 'pointer-events-none' : undefined}
        >
          {safeImages.map((image, index) => (
            <CarouselItem key={index}>
              <Image
                src={image.urlNormal}
                alt={image.description ?? `offer image ${index + 1}`}
                width={920}
                height={520}
                className={cn('w-full object-cover h-[260px]', imageClassName)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Optional custom overlays */}
        {children}

        {/* Special badge (reservation handled with bottom banner) */}
        {isSpecial && (
          <div className='absolute left-0 top-0 bg-green-primary rounded-br-xl p-2'>
            <Star className='size-5 text-white' />
          </div>
        )}

        {/* Bottom gradient */}
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-[36px] bg-[#00000026] backdrop-blur-sm bg-gradient-to-t from-black/55 to-black/0',
            overlayRoundedBottom && 'rounded-b-xl'
          )}
        />

        {/* Bottom controls or reservation banner */}
        {isReservation ? (
          <div
            className={cn(
              'absolute inset-x-0 bottom-0',
              overlayRoundedBottom && 'rounded-b-xl'
            )}
          >
            <div className='w-full bg-yellow-400 text-black text-center font-bold uppercase tracking-wide text-xs py-2'>
              REZERWACJA
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2 text-white',
              overlayRoundedBottom && 'rounded-b-xl'
            )}
          >
            <span className='flex items-baseline gap-0.5'>
              <span className='text-sm font-medium'>{currentIndex + 1}</span>
              <span className='text-xs font-normal'>/{totalSlides}</span>
            </span>

            <div className='flex items-center gap-1.5 mx-auto'>
              {safeImages.map((_, index) => (
                <button
                  type='button'
                  key={index}
                  aria-label={`Przejdź do slajdu ${index + 1}`}
                  aria-current={index === currentIndex}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    'rounded-full cursor-pointer outline-none focus-visible:ring-[2px] focus-visible:ring-white/60',
                    index === currentIndex
                      ? 'h-1.5 w-1.5 bg-green-primary'
                      : 'h-1 w-1 bg-white/70'
                  )}
                />
              ))}
            </div>

            <CarouselNext className='pointer-events-auto right-1.5 bottom-1.5 top-auto -translate-y-0 hover:bg-white hover:text-[#1E1E1E]' />
          </div>
        )}
      </Carousel>
    </div>
  );
}
