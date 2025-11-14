'use client';

import { useState } from 'react';
import Image from 'next/image';

type AgentImageProps = {
  imagePath: string;
  fullName: string;
  className?: string;
};

export default function AgentImage({
  imagePath,
  fullName,
  className,
}: AgentImageProps) {
  const [imageError, setImageError] = useState(false);
  const firstLetter = fullName.charAt(0).toUpperCase();

  if (imageError) {
    return (
      <div
        className={`${className} bg-green-primary flex items-center justify-center`}
      >
        <span className='text-white font-bold text-[120px]'>{firstLetter}</span>
      </div>
    );
  }

  return (
    <Image
      src={imagePath}
      alt={fullName}
      fill
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
