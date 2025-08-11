"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

type HeroProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export default function Hero({ src, alt, priority = true, className }: HeroProps) {
  return (
    <div
      className={cn(
        'relative w-full h-[480px] md:h-[640px] lg:h-[754px] overflow-hidden rounded-[24px]',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className='object-cover'
        sizes='100vw'
      />
    </div>
  );
}


