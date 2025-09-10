'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationProps = {
  className?: string;
  currentPage?: number; // 1-based
  totalPages?: number;
  onPageChange?: (page: number) => void;
  getHref?: (page: number) => string;
};

// Front-first pagination UI with future-proof props
export default function Pagination({
  className,
  currentPage = 1,
  totalPages = 12,
  onPageChange,
  getHref,
}: PaginationProps) {
  const makePageItems = (
    page: number,
    total: number
  ): Array<number | 'ellipsis'> => {
    if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
    // Simple window: show 1, 2, 3, ..., total
    return [1, 2, 3, 'ellipsis', total];
  };

  const items = makePageItems(currentPage, totalPages);

  const baseChip = 'inline-flex size-10 items-center justify-center rounded-xl';
  const inactiveChip = cn(baseChip, 'hover:bg-[#F4F4F4]');
  const activeChip = cn(baseChip, 'bg-[#EAF6E8] text-green-primary font-bold');

  const handleClick = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange?.(page);
  };

  return (
    <nav
      aria-label='Paginacja'
      className={cn(
        'flex items-center gap-0 text-[#757575] text-sm/5',
        className
      )}
    >
      {items.map((it, idx) => {
        if (it === 'ellipsis') {
          return (
            <span
              key={`e-${idx}`}
              className='inline-flex size-10 items-center justify-center select-none'
              aria-hidden='true'
            >
              …
            </span>
          );
        }

        const isActive = it === currentPage;
        const content = (
          <span
            className={isActive ? activeChip : inactiveChip}
            aria-current={isActive ? 'page' : undefined}
          >
            {it}
          </span>
        );

        if (getHref) {
          return (
            <a key={it} href={getHref(it)} aria-label={`Strona ${it}`}>
              {content}
            </a>
          );
        }

        return (
          <button
            key={it}
            type='button'
            aria-label={`Strona ${it}`}
            onClick={() => handleClick(it)}
            className='contents'
          >
            {content}
          </button>
        );
      })}

      <button
        type='button'
        aria-label='Następna strona'
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-full text-[#343434] hover:bg-[#F4F4F4]',
          currentPage >= totalPages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronRight className='size-5' />
      </button>
    </nav>
  );
}
