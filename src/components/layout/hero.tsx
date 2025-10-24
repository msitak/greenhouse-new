'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type HeroProps = {
  src: string;
  alt: string;
  priority?: boolean;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  sizes?: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayColor?: string;
};

export default function Hero({
  src,
  alt,
  priority = true,
  quality,
  fit = 'cover',
  objectPosition,
  sizes = '100vw',
  className,
  children,
  overlay = false,
  overlayColor = '#00000080',
}: HeroProps) {
  return (
    <div className={cn('md:px-2 md:pt-2 md:pb-4', className)}>
      <div className='relative w-full h-[calc(100svh-24px)] md:overflow-hidden md:rounded-[24px]'>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          className={`object-${fit}`}
          sizes={sizes}
          style={objectPosition ? { objectPosition } : undefined}
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
