'use client';

import { useEffect, useState } from 'react';
import {
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel';

export default function MobileCarouselControls() {
  const { api } = useCarousel();
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    const onSelect = () => setIndex(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <div className='mt-4 flex items-center justify-center gap-6 md:hidden'>
      <CarouselPrevious className='static size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]' />
      <div className='flex items-center gap-2'>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-[#4FA200]' : 'bg-[#0000000A]'}`}
          />
        ))}
      </div>
      <CarouselNext className='static size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]' />
    </div>
  );
}
