'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import AgentAvatar from '../AgentAvatar';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  type CarouselApi,
} from '../ui/carousel';
import { formatPrice, formatFloor, cn } from '@/lib/utils';
import {
  ChevronRight,
  Layers,
  MapPin,
  Home,
  RulerDimensionLine,
  CircleDollarSign,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export type OfferTileListing = {
  id: string;
  slug: string;
  title: string | null;
  price: number | null;
  pricePerM2: number | null;
  area: number | null;
  roomsCount: number | null;
  floor: number | null;
  offerType: string | null;
  agentName: string | null;
  agentSurname: string | null;
  locationCity: string | null;
  locationStreet: string | null;
  isReservation?: boolean | null;
  images: {
    urlNormal: string | null;
    urlThumbnail: string | null;
    description: string | null;
  }[];
};

type OfferTileProps = {
  listing: OfferTileListing | null;
  isLoading?: boolean;
};

const FALLBACK_IMAGE = '/test-image.jpg';
const MAX_INDICATORS = 20;
const TILE_WIDTH = 424;
const TILE_HEIGHT = 239;

const OfferTileSkeleton: React.FC = () => {
  return (
    <div className='relative rounded-2xl w-full overflow-hidden bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
      <Skeleton
        className='w-full rounded-t-2xl'
        style={{ aspectRatio: `${TILE_WIDTH} / ${TILE_HEIGHT}` }}
      />
      <div className='p-4'>
        <Skeleton className='h-6 w-3/4 mb-3' />
        <div className='flex gap-6 mb-3 min-h-[24px]'>
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-6 w-16' />
          <Skeleton className='h-6 w-20' />
        </div>
        <Skeleton className='h-[1px] w-full my-2' />
        <div className='flex items-center justify-between pt-2'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-8 w-8 rounded' />
        </div>
      </div>
    </div>
  );
};

const OfferTile: React.FC<OfferTileProps> = ({ listing, isLoading }) => {
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

  if (isLoading || !listing) {
    return <OfferTileSkeleton />;
  }

  const images = listing.images?.length
    ? listing.images
    : [
        {
          urlNormal: FALLBACK_IMAGE,
          urlThumbnail: FALLBACK_IMAGE,
          description: null,
        },
      ];
  const totalSlides = images.length;
  const limitedIndicators = images.slice(0, MAX_INDICATORS);

  const locationLabel = [listing.locationStreet, listing.locationCity]
    .filter(Boolean)
    .join(', ');

  // Generuj nazwę agenta dla badge (samo imię) i pełną nazwę dla zdjęcia
  // W bazie agentName zawiera pełne imię i nazwisko (np. "Małgorzata Walas")
  const agentFullName = listing.agentName;
  const agentFirstName = agentFullName ? agentFullName.split(' ')[0] : null;

  // Automatycznie generuj ścieżkę do pliku: "Małgorzata Walas" → "Małgorzata_Walas.png"
  const agentImagePath = agentFullName
    ? agentFullName.replace(/ /g, '_')
    : null;

  const handleIndicatorClick = (index: number) => {
    if (!api) return;
    if (totalSlides <= MAX_INDICATORS || index < MAX_INDICATORS - 1) {
      api.scrollTo(index);
      return;
    }

    // ostatni widoczny znacznik prowadzi do ostatniego slajdu
    api.scrollTo(totalSlides - 1);
  };

  return (
    <div className='relative rounded-2xl w-full overflow-hidden bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
      <Carousel
        className='w-full'
        setApi={setApi}
        disableKeyboard={listing.isReservation === true}
      >
        <CarouselContent
          viewportClassName={
            listing.isReservation ? 'pointer-events-none' : undefined
          }
        >
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div
                className='relative overflow-hidden rounded-t-2xl bg-[#f5f5f5] w-full'
                style={{ aspectRatio: `${TILE_WIDTH} / ${TILE_HEIGHT}` }}
              >
                <Image
                  src={image.urlNormal ?? FALLBACK_IMAGE}
                  alt={image.description ?? `offer image ${index + 1}`}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {agentFullName && (
          <div className='absolute top-3 left-3 flex gap-2 items-center py-0.5 pl-0.5 pr-2 rounded-full w-fit bg-[#FFFFFF]/60 backdrop-blur-xs shadow-[0_4px_16px_0_rgba(164,167,174,0.12)]'>
            <AgentAvatar
              agentName={agentFullName}
              agentImagePath={
                agentImagePath ? `/agents/${agentImagePath}.png` : null
              }
              size='small'
            />
            <span className='font-bold text-xs'>{agentFirstName}</span>
          </div>
        )}

        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[36px] bg-[#00000026] backdrop-blur-sm bg-gradient-to-t from-black/55 to-black/0' />

        {listing.isReservation ? (
          <div className='absolute inset-x-0 bottom-0'>
            <div className='w-full h-[36px] flex items-center justify-center bg-yellow-400 text-black font-bold uppercase tracking-wide text-xs'>
              REZERWACJA
            </div>
          </div>
        ) : (
          <div className='absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2 text-white'>
            <span className='flex items-baseline gap-0.5'>
              <span className='text-sm font-medium'>{currentIndex + 1}</span>
              <span className='text-xs font-normal'>/{totalSlides}</span>
            </span>
            <div className='flex items-center gap-1.5 mx-auto'>
              {limitedIndicators.map((_, index) => {
                const isActive =
                  totalSlides <= MAX_INDICATORS
                    ? index === currentIndex
                    : index < MAX_INDICATORS - 1
                      ? index === currentIndex
                      : currentIndex >= MAX_INDICATORS - 1;

                return (
                  <button
                    type='button'
                    key={index}
                    aria-label={`Przejdź do slajdu ${
                      totalSlides <= MAX_INDICATORS ||
                      index < MAX_INDICATORS - 1
                        ? index + 1
                        : totalSlides
                    }`}
                    aria-current={isActive}
                    onClick={() => handleIndicatorClick(index)}
                    className={`rounded-full cursor-pointer outline-none focus-visible:ring-[2px] focus-visible:ring-white/60 ${
                      isActive
                        ? 'h-1.5 w-1.5 bg-green-primary'
                        : 'h-1 w-1 bg-white/70'
                    }`}
                  />
                );
              })}
            </div>
            <CarouselNext className='pointer-events-auto right-1.5 bottom-1.5 top-auto -translate-y-0 hover:bg-white hover:text-[#1E1E1E]' />
          </div>
        )}
      </Carousel>

      <div className='p-4 relative'>
        <p className='font-medium text-base mb-3 flex items-center gap-2 text-gray-900'>
          <MapPin className='size-4 text-gray-700' />
          {locationLabel || 'Lokalizacja niedostępna'}
        </p>

        <div className='flex gap-2 md:gap-4 mb-3 text-gray-700 min-h-[24px] items-center'>
          {listing.area != null && (
            <div className='flex items-center gap-1 md:gap-1.5'>
              <RulerDimensionLine className='size-4 text-gray-600' />
              <span className='text-sm'>{Math.round(listing.area)} m²</span>
            </div>
          )}
          {listing.roomsCount != null && (
            <div className='flex items-center gap-1 md:gap-1.5'>
              <Home className='size-4 text-gray-600' />
              <span className='text-sm'>{listing.roomsCount} pokoje</span>
            </div>
          )}
          {listing.floor != null && (
            <div className='flex items-center gap-1 md:gap-1.5'>
              <Layers className='size-4 text-gray-600' />
              <span className='text-sm'>
                {formatFloor(listing.floor, true)}
              </span>
            </div>
          )}
          {listing.price != null && listing.area != null && (
            <div className='flex items-center gap-1 md:gap-1.5'>
              <CircleDollarSign className='size-4 text-gray-600' />
              <span className='text-sm'>
                {formatPrice(Math.round(listing.price / listing.area))}/m²
              </span>
            </div>
          )}
        </div>

        <Separator className='bg-[#F4F4F4] my-2' />

        <div className='flex items-center justify-between pt-2'>
          <h2 className='font-black text-2xl text-green-primary leading-none font-[family-name:var(--font-satoshi)]'>
            {listing.price != null
              ? formatPrice(listing.price)
              : 'Cena w ofercie'}
          </h2>

          <Link
            href={`/nieruchomosci/${listing.slug}`}
            className='flex items-center justify-center size-8 rounded border border-[#00000026] bg-white hover:bg-gray-50 transition-colors'
            aria-label='Zobacz szczegóły oferty'
          >
            <ChevronRight className='size-6 text-[#1E1E1E]' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export { OfferTileSkeleton };
export default OfferTile;
