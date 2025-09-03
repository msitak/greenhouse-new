'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type HeroProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayColor?: string;
};

export default function Hero({
  src,
  alt,
  priority = true,
  className,
  children,
  overlay = false,
  overlayColor = '#00000080',
}: HeroProps) {
  return (
    <div className={cn('px-2 pt-2 pb-4', className)}>
      <div className='relative w-full h-[calc(100svh-24px)] overflow-hidden rounded-[24px]'>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className='object-cover'
          sizes='100vw'
        />
        {overlay ? (
          <div
            className='absolute inset-0'
            style={{ backgroundColor: overlayColor }}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
