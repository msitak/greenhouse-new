'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import PhotoCarousel from '@/components/ui/photoCarousel';
import Loadable from '@/components/ui/loadable';
import { Lightbox } from '@/components/ui/lightbox';
import { ListingApiResponse, ListingImageApiResponse } from '@/types/api.types';
import { formatPrice } from '@/lib/utils';

type ListingGalleryProps = {
  listing: ListingApiResponse;
  carouselImages: ListingImageApiResponse[];
  floorPlanImage?: ListingImageApiResponse;
  listingId: string;
  fullAddress: string;
  offerTypeLabel: string;
  isSaleOffer: boolean;
  calculatedPricePerM2: number | null;
  isLoading?: boolean;
};

export default function ListingGallery({
  listing,
  carouselImages,
  floorPlanImage,
  listingId,
  fullAddress,
  offerTypeLabel,
  isSaleOffer,
  calculatedPricePerM2,
  isLoading = false,
}: ListingGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Open lightbox at specific index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Handle floor plan click: Open lightbox at the index of the floor plan in carouselImages
  // We assume the floor plan is the LAST item in carouselImages.
  const handleFloorPlanClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (carouselImages.length > 0) {
      openLightbox(carouselImages.length - 1);
    }
  };

  return (
    <>
      {/* Desktop: Top media gallery */}
      <div className='hidden lg:grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] max-w-[1200px] mx-auto'>
        <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
          <Loadable isLoading={isLoading} skeletonClassName='h-[462px] w-full'>
            {carouselImages.length > 0 ? (
              <PhotoCarousel
                imageClassName='h-[462px]'
                images={carouselImages}
                overlayRoundedBottom
                onImageClick={openLightbox}
                withLightbox={false} // Controlled externally via onImageClick
              />
            ) : (
              <div className='h-[462px] w-full bg-gray-200 flex items-center justify-center'>
                <span className='text-gray-500'>Brak zdjęć</span>
              </div>
            )}
          </Loadable>
        </div>

        <div className='flex flex-col space-y-6'>
          {floorPlanImage && (
            <div
              className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden cursor-pointer'
              onClick={handleFloorPlanClick}
            >
              <Loadable
                isLoading={isLoading}
                skeletonClassName='h-[219px] w-full'
              >
                <Image
                  src={floorPlanImage.urlNormal}
                  alt='Floor plan'
                  width={424}
                  height={220}
                  className='h-[219px] w-full object-contain bg-gray-50'
                />
              </Loadable>
            </div>
          )}
          {listing.virtualTourUrl && (
            <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
              <Loadable
                isLoading={isLoading}
                skeletonClassName='h-[219px] w-full'
              >
                <a
                  href={listing.virtualTourUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block relative group cursor-pointer'
                >
                  {listing.images.length > 0 ? (
                    <Image
                      src={listing.images[0].urlNormal}
                      width={424}
                      height={220}
                      className='h-[219px] w-full object-cover'
                      alt='Virtual tour'
                    />
                  ) : (
                    <div className='h-[219px] w-full bg-gray-200' />
                  )}
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#00000073] group-hover:bg-[#00000099] transition-colors'>
                    <Play className='size-10 text-white mb-1' />
                    <span className='text-white font-bold text-sm'>
                      Wirtualny spacer
                    </span>
                  </div>
                </a>
              </Loadable>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Details first */}
      <div className='lg:hidden max-w-[1200px] mx-auto'>
        <section className='rounded-2xl bg-white p-4 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='flex items-center justify-between text-sm text-[--color-text-primary]'>
            <span>{offerTypeLabel}</span>
            <span>ID: {listingId}</span>
          </div>
          <h1 className='mt-3 text-[32px]/[40px] font-bold'>
            {listing.title || fullAddress || 'Nieruchomość'}
          </h1>
          <div className='flex items-center justify-between mt-3'>
            <div className='text-[32px]/[32px] font-black text-[#448C00]'>
              {listing.price ? formatPrice(listing.price) : 'Cena w ofercie'}
            </div>
            {isSaleOffer && calculatedPricePerM2 && (
              <div className='text-gray-500 text-[20px] mt-1 font-medium'>
                {formatPrice(calculatedPricePerM2)} / m²
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Mobile: Media stack - 1) Carousel, 2) Floor plan, 3) Virtual tour */}
      <div className='lg:hidden max-w-[1200px] mx-auto mt-6 space-y-6'>
        {/* 1) Carousel */}
        <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
          <Loadable isLoading={isLoading} skeletonClassName='h-[239px] w-full'>
            {carouselImages.length > 0 ? (
              <PhotoCarousel
                imageClassName='h-[239px]'
                images={carouselImages}
                overlayRoundedBottom
                onImageClick={openLightbox}
                withLightbox={false} // Controlled externally
              />
            ) : (
              <div className='h-[239px] w-full bg-gray-200 flex items-center justify-center'>
                <span className='text-gray-500'>Brak zdjęć</span>
              </div>
            )}
          </Loadable>
        </div>

        {/* 2) Virtual tour */}
        {listing.virtualTourUrl && (
          <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
            <a
              href={listing.virtualTourUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='block relative group cursor-pointer'
            >
              {listing.images.length > 0 ? (
                <Image
                  src={listing.images[0].urlNormal}
                  width={800}
                  height={450}
                  className='w-full h-auto object-cover'
                  alt='Virtual tour'
                />
              ) : (
                <div className='w-full h-[200px] bg-gray-200' />
              )}
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#00000073] group-hover:bg-[#00000099] transition-colors'>
                <Play className='size-10 text-white mb-1' />
                <span className='text-white font-bold text-sm'>
                  Wirtualny spacer
                </span>
              </div>
            </a>
          </div>
        )}

        {/* 3) Floor plan */}
        {floorPlanImage && (
          <div
            className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden cursor-pointer'
            onClick={handleFloorPlanClick}
          >
            <Image
              src={floorPlanImage.urlNormal}
              alt='Floor plan'
              width={800}
              height={450}
              className='w-full h-auto object-contain bg-gray-50'
            />
          </div>
        )}
      </div>

      <Lightbox
        images={carouselImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
