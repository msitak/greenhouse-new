'use client';

import { useState } from 'react';
import Image from 'next/image';

type AgentAvatarProps = {
  agentName: string;
  agentImagePath: string | null;
  size?: 'small' | 'large';
};

export default function AgentAvatar({
  agentName,
  agentImagePath,
  size = 'large',
}: AgentAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const agentFirstName = agentName.split(' ')[0];

  // Rozmiary i style dla różnych wariantów
  const dimensions =
    size === 'large'
      ? {
          container: 'size-[104px]',
          image: 112,
          border: 'border-4 border-accent p-1',
        }
      : { container: 'size-6', image: 24, border: '' };

  const textSize = size === 'large' ? 'text-4xl' : 'text-xs';

  return (
    <div
      className={`${dimensions.container} mx-auto rounded-full overflow-hidden flex items-center justify-center`}
    >
      {!imageError && agentImagePath ? (
        <Image
          src={agentImagePath}
          alt={agentName}
          width={dimensions.image}
          height={dimensions.image}
          className={`size-full rounded-full ${dimensions.border}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`flex items-center justify-center size-full rounded-full bg-green-primary text-white ${textSize} font-bold ${dimensions.border}`}
        >
          {agentFirstName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
