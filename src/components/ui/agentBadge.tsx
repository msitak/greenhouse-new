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
  agentName: AGENT_NAME;
  className?: string;
  placement?: 'homepage' | 'listing';
}

const agentBadge = ({
  agentName,
  className,
  placement = 'homepage',
}: IProps) => {
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
      <Image
        src={`/agents/${agentName}.png`}
        alt={agentName}
        width={24}
        height={24}
        className='rounded-full'
      />
      <span className='font-bold text-xs'>{agentName}</span>
    </div>
  );
};

export default agentBadge;
