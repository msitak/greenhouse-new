import React from 'react';
import Image from 'next/image';

export enum AGENT_NAME {
  PATRYK = 'Patryk',
  ANNA = 'Anna',
  ARTUR = 'Artur',
  JAKUB = 'Jakub',
  MIHAŁ = 'Michał',
}

interface IProps {
  agentName: AGENT_NAME;
  className: string;
}

const agentBadge = ({ agentName, className }: IProps) => {
  return (
    <div
      className={`flex gap-2 items-center py-0.5 pl-0.5 pr-2 rounded-full bg-[#FFFFFF]/60 w-fit backdrop-blur-xs shadow-[0,4px,16px,0,rgba(164,167,174,0.12)] ${className}`}
    >
      <Image
        src={`/agents/${agentName}.png`}
        alt='Patryk'
        width={24}
        height={24}
        className='rounded-full'
      />
      <span className='font-bold text-sm'>{agentName}</span>
    </div>
  );
};

export default agentBadge;
