'use client';

import { useState } from 'react';
import Image from 'next/image';

type AuthorAvatarProps = {
  firstName: string;
  lastName: string;
};

export default function AuthorAvatar({
  firstName,
  lastName,
}: AuthorAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const imagePath = `/agents/${firstName}_${lastName}.png`;

  return (
    <div className='relative w-[120px] h-[120px] mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-primary p-1'>
      {!imageError ? (
        <Image
          src={imagePath}
          alt={`${firstName} ${lastName}`}
          width={120}
          height={120}
          className='rounded-full object-cover'
          onError={() => setImageError(true)}
        />
      ) : (
        <div className='flex items-center justify-center size-full rounded-full bg-green-primary text-white text-4xl font-bold'>
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
