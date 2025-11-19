'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type TransactionKind = 'sale' | 'rent';

type AgentListingsKindSwitchProps = {
  value: TransactionKind;
};

export default function AgentListingsKindSwitch({
  value,
}: AgentListingsKindSwitchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = (nextValue: string) => {
    if (nextValue !== 'sale' && nextValue !== 'rent') return;
    if (nextValue === value) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextValue === 'sale') {
        params.delete('kind');
      } else {
        params.set('kind', nextValue);
      }
      params.delete('page');

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(nextUrl, { scroll: false });
    });
  };

  return (
    <div className='inline-flex items-center justify-center gap-0 rounded-xl bg-gray-100 p-0'>
      <ToggleGroup
        type='single'
        value={value}
        onValueChange={handleChange}
        className='flex items-center'
      >
        <ToggleGroupItem value='sale' variant='pill' className='px-8 py-2'>
          Sprzedaż
        </ToggleGroupItem>
        <ToggleGroupItem value='rent' variant='pill' className='px-8 py-2'>
          Wynajem
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
