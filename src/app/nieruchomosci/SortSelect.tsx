'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortKey = 'newest' | 'price-desc' | 'price-asc' | 'area-asc' | 'area-desc';

export default function SortSelect({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('sort', value);
    params.set('page', '1');
    params.set('transition', 'sort');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select defaultValue={current} onValueChange={onChange}>
      <SelectTrigger className='rounded-xl bg-[#F7F7F7] text-[#6E6E6E] font-medium border-0 px-4 py-3 text-sm cursor-pointer'>
        <SelectValue placeholder='Sortowanie' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='newest'>Od najnowszych</SelectItem>
        <SelectItem value='price-desc'>Cena malejąco</SelectItem>
        <SelectItem value='price-asc'>Cena rosnąco</SelectItem>
        <SelectItem value='area-asc'>Metraż rosnąco</SelectItem>
        <SelectItem value='area-desc'>Metraż malejąco</SelectItem>
      </SelectContent>
    </Select>
  );
}


