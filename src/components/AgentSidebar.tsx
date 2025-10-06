'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Loadable from '@/components/ui/loadable';
import AgentAvatar from '@/components/AgentAvatar';

type AgentSidebarProps = {
  agentName: string;
  agentPhone: string | null;
  agentImagePath: string | null;
  isLoading?: boolean;
};

export default function AgentSidebar({
  agentName,
  agentPhone,
  agentImagePath,
  isLoading = false,
}: AgentSidebarProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePhoneClick = async () => {
    if (!agentPhone) return;

    if (!showPhone) {
      // First click: show phone number
      setShowPhone(true);
    } else {
      // Second click: copy to clipboard
      try {
        await navigator.clipboard.writeText(agentPhone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy phone number:', error);
      }
    }
  };

  return (
    <aside className='sticky top-4 rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
      <Loadable
        isLoading={isLoading}
        className='mx-auto size-[104px] rounded-full overflow-hidden'
        skeletonClassName='size-full rounded-full'
      >
        <AgentAvatar
          agentName={agentName}
          agentImagePath={agentImagePath}
          size='large'
        />
      </Loadable>
      <div className='mt-4 text-center'>
        <div className='text-2xl font-bold'>{agentName}</div>
        <div className='text-xs text-[--color-text-secondary]'>
          Specjalista ds. nieruchomości
        </div>
      </div>
      <div className='mt-4'>
        <Button className='w-full rounded-xl' size='sm' variant='default'>
          Umów się na prezentację
        </Button>
      </div>
      <div className='mt-2 text-center'>
        <Button
          variant='outline'
          size='sm'
          className='w-full rounded-xl'
          onClick={handlePhoneClick}
        >
          {copied ? 'Skopiowano!' : showPhone && agentPhone ? agentPhone : 'Pokaż numer'}
        </Button>
      </div>
    </aside>
  );
}

