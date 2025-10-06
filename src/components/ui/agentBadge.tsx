import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export enum AGENT_NAME {
  PATRYK = 'Patryk',
  ANNA = 'Anna',
  ARTUR = 'Artur',
  JAKUB = 'Jakub',
  MIHAŁ = 'Michał',
}

interface IProps {
  // Backward compatible enum prop
  agentName?: AGENT_NAME;
  // Preferred: full display name from backend, e.g. "Patryk Bugaj"
  name?: string;
  // If you pass only first name for display, use this to load the correct image
  fullNameForImage?: string;
  className?: string;
  placement?: 'homepage' | 'listing';
}

const agentBadge = ({ agentName, name, fullNameForImage, className, placement = 'homepage' }: IProps) => {
  // Map short agent names to actual asset filenames in public/agents
  const AGENT_FILE_MAP: Record<AGENT_NAME, string> = {
    [AGENT_NAME.PATRYK]: 'Patryk_Bugaj.png',
    [AGENT_NAME.ANNA]: 'Anna_Kuc.png',
    [AGENT_NAME.ARTUR]: 'Artur_Sitak.png',
    [AGENT_NAME.JAKUB]: 'Jakub_Pruszyński.png',
    [AGENT_NAME.MIHAŁ]: 'Michał_Papież.png',
  };
  const displayName = name ?? agentName;
  // If full name provided, construct file path using underscores; keep diacritics
  const sourceName = fullNameForImage || name;
  const imageSrc = sourceName
    ? `/agents/${sourceName.replace(/ /g, '_')}.png`
    : agentName
    ? `/agents/${AGENT_FILE_MAP[agentName]}`
    : undefined;
  return (
    <div
      className={cn(
        'flex gap-2 items-center py-0.5 pl-0.5 pr-2 rounded-full w-fit',
        placement === 'listing'
          ? 'bg-[#000000]/5 shadow-[0_8px_40px_0_rgba(164,167,174,0.12),_0_4px_16px_0_rgba(164,167,174,0.04)]'
          : 'bg-[#FFFFFF]/60 backdrop-blur-xs shadow-[0_4px_16px_0_rgba(164,167,174,0.12)]',
        className
      )}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={String(displayName)}
          width={24}
          height={24}
          className='rounded-full'
        />
      )}
      <span className='font-bold text-xs'>{String(displayName)}</span>
    </div>
  );
};

export default agentBadge;
