'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type PaginationProps = {
  className?: string;
  currentPage?: number; // 1-based
  totalPages?: number;
  onPageChange?: (page: number) => void;
  getHref?: (page: number) => string; // legacy - avoid passing from Server Components
  hrefPrefix?: string; // preferred for Server Components: e.g. "/nieruchomosci?page="
  hrefHash?: string; // optional anchor id, e.g. 'listings' -> adds #listings
  smoothScrollTargetId?: string; // element id for smooth scroll on navigation
};

// Front-first pagination UI with future-proof props
export default function Pagination({
  className,
  currentPage = 1,
  totalPages = 12,
  onPageChange,
  getHref,
  hrefPrefix,
  hrefHash,
  smoothScrollTargetId,
}: PaginationProps) {
  const router = useRouter();
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
        'flex items-center gap-0 text-[--color-text-secondary] text-sm/5',
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

        const href = hrefPrefix
          ? `${hrefPrefix}${it}${hrefHash ? `#${hrefHash}` : ''}`
          : undefined;

        if (hrefPrefix && href) {
          return (
            <a
              key={it}
              href={href}
              aria-label={`Strona ${it}`}
              onClick={e => {
                e.preventDefault();
                router.push(href, { scroll: false });
                if (smoothScrollTargetId) {
                  setTimeout(() => {
                    document
                      .getElementById(smoothScrollTargetId)
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 0);
                }
              }}
            >
              {content}
            </a>
          );
        }

        if (getHref) {
          const h = getHref(it);
          return (
            <a
              key={it}
              href={h}
              aria-label={`Strona ${it}`}
              onClick={e => {
                e.preventDefault();
                router.push(h, { scroll: false });
                if (smoothScrollTargetId) {
                  setTimeout(() => {
                    document
                      .getElementById(smoothScrollTargetId)
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 0);
                }
              }}
            >
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
        onClick={() => {
          const next = currentPage + 1;
          if (next > totalPages) return;
          if (hrefPrefix) {
            const href = `${hrefPrefix}${next}${hrefHash ? `#${hrefHash}` : ''}`;
            router.push(href, { scroll: false });
            if (smoothScrollTargetId) {
              setTimeout(() => {
                document
                  .getElementById(smoothScrollTargetId)
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 0);
            }
            return;
          }
          handleClick(next);
        }}
        disabled={currentPage >= totalPages}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-full text-[--color-text-primary] hover:bg-[#F4F4F4]',
          currentPage >= totalPages && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ChevronRight className='size-5' />
      </button>
    </nav>
  );
}
