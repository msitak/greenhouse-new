'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListingImageApiResponse } from '@/types/api.types';
import { Button } from '@/components/ui/button';

interface LightboxProps {
  images: ListingImageApiResponse[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_INDICATORS = 20;

export function Lightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Handle hydration safely for portal
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal index when opening
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoaded(false);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Navigation functions
  const showNext = React.useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setIsLoaded(false);
  }, [images.length]);

  const showPrev = React.useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setIsLoaded(false);
  }, [images.length]);

  const goToIndex = React.useCallback((index: number) => {
    setCurrentIndex(index);
    setIsLoaded(false);
  }, []);

  // Keyboard support
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showNext, showPrev]);

  // Touch / Swipe support
  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) showNext();
    if (isRightSwipe) showPrev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isOpen || !mounted) return null;

  const currentImage = images[currentIndex];
  const nextIndex = (currentIndex + 1) % images.length;
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const totalSlides = images.length;

  const limitedIndicators = images.slice(0, MAX_INDICATORS);

  return createPortal(
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300'
      role='dialog'
      aria-modal='true'
      aria-label='Galeria zdjęć'
    >
      {/* Backdrop click handler */}
      <div className='absolute inset-0 z-0' onClick={onClose} />

      {/* Central Card Wrapper */}
      <div
        className='relative flex items-center justify-center rounded-2xl overflow-hidden bg-transparent shadow-2xl max-w-[90vw] max-h-[85vh] pointer-events-auto group'
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading Spinner */}
        {!isLoaded && (
          <div className='absolute inset-0 z-0 flex items-center justify-center'>
            <div className='w-10 h-10 border-4 border-white/20 border-t-white/80 rounded-full animate-spin' />
          </div>
        )}

        {/* Close Button - Top Right (Inside Card) */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-[60] p-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-white/10 rounded-full backdrop-blur-md'
          aria-label='Zamknij galerię'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Main Image (Using img tag for shrink-wrapping) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentImage.urlOriginal || currentImage.urlNormal}
          src={currentImage.urlOriginal || currentImage.urlNormal || ''}
          alt={currentImage.description || `Zdjęcie ${currentIndex + 1}`}
          className={cn(
            'max-w-[90vw] max-h-[85vh] object-contain block select-none',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          draggable={false}
        />

        {/* Bottom Controls Bar (Overlaid on Image) */}
        <div className='absolute bottom-0 left-0 right-0 z-50'>
          {/* Blur & Gradient Background */}
          <div className='absolute inset-0 h-[58px] bg-[#00000026] backdrop-blur-sm bg-gradient-to-t from-black/55 to-black/0' />

          {/* Controls Content */}
          <div className='relative flex items-center justify-between px-4 h-[58px] text-white w-full'>
            {/* Left: Counter */}
            <span className='flex items-baseline gap-0.5'>
              <span className='text-sm font-medium'>{currentIndex + 1}</span>
              <span className='text-xs font-normal'>/{totalSlides}</span>
            </span>

            {/* Center: Dots */}
            <div className='flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2'>
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
                    onClick={e => {
                      e.stopPropagation();
                      if (
                        totalSlides <= MAX_INDICATORS ||
                        index < MAX_INDICATORS - 1
                      ) {
                        goToIndex(index);
                      } else {
                        goToIndex(totalSlides - 1);
                      }
                    }}
                    className={cn(
                      'rounded-full cursor-pointer outline-none focus-visible:ring-[2px] focus-visible:ring-white/60 transition-all',
                      isActive
                        ? 'h-1.5 w-1.5 bg-green-primary'
                        : 'h-1 w-1 bg-white/70'
                    )}
                  />
                );
              })}
            </div>

            {/* Right: Prev / Next Buttons */}
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='size-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0'
                onClick={e => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label='Poprzednie zdjęcie'
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className='size-8 rounded-full bg-white/10 hover:bg-white/20 text-white border-0'
                onClick={e => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label='Następne zdjęcie'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preload Adjacent Images (Hidden) */}
      <div className='hidden'>
        {images.length > 1 && (
          <>
            <Image
              src={images[nextIndex].urlOriginal || images[nextIndex].urlNormal}
              alt='preload next'
              width={1}
              height={1}
              priority={false}
            />
            <Image
              src={images[prevIndex].urlOriginal || images[prevIndex].urlNormal}
              alt='preload prev'
              width={1}
              height={1}
              priority={false}
            />
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
