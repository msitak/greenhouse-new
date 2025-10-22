'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type AgentCardProps = {
  name: string;
  title?: string;
  imageSrc: string | null;
  imageAlt?: string;
  className?: string; // wrapper
  imageWrapperClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  onActionClick?: () => void;
  actionAriaLabel?: string;
  fullWidth?: boolean; // for mobile full width
};

export default function AgentCard({
  name,
  title,
  imageSrc,
  imageAlt = name,
  className,
  imageWrapperClassName,
  imageWidth = 364,
  imageHeight = 288,
  onActionClick,
  actionAriaLabel = 'Zobacz profil agenta',
  fullWidth = false,
}: AgentCardProps) {
  const [imageError, setImageError] = useState(false);
  const agentFirstName = name.split(' ')[0];

  const containerWidth = fullWidth ? 'w-full' : 'w-[288px]';
  const imageWidthClass = fullWidth ? 'w-full' : 'w-[288px]';
  const imageHeightClass = 'h-[364px]';
  const fallbackHeightClass = 'h-[364px]';
  const textSizeClass = 'text-[120px]';
  const objectFitClass = 'object-cover';
  const objectPositionClass = fullWidth ? 'object-top' : 'object-center';

  return (
    <div className={className}>
      <div
        className={cn(
          'rounded-2xl relative',
          containerWidth,
          imageWrapperClassName
        )}
      >
        {!imageError && imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className={cn(
              'rounded-2xl',
              objectFitClass,
              objectPositionClass,
              imageWidthClass,
              imageHeightClass
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={cn(
              'rounded-2xl bg-green-primary flex items-center justify-center',
              imageWidthClass,
              fallbackHeightClass
            )}
          >
            <span className={cn('text-white font-bold', textSizeClass)}>
              {agentFirstName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className='flex justify-between items-center h-[60px] absolute bottom-3 left-3 bg-white rounded-2xl p-3 w-[calc(100%-24px)]'>
          <div className='flex flex-col'>
            <div className='text-[--color-text-primary] font-bold text-md/5'>
              {name}
            </div>
            {title && (
              <div className='text-[#2C8E3A] font-medium text-xs/4'>
                {title}
              </div>
            )}
          </div>
          <Button
            variant='arrow'
            size='icon'
            className='rounded-full border-1 border-[#353535] hover:bg-[#0000001F] hover:text-[#353535] size-8'
            onClick={onActionClick}
            aria-label={actionAriaLabel}
          >
            <ArrowUpRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
