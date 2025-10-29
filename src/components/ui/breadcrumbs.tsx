'use client';

import Link from 'next/link';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { breadcrumbLabels } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';

function toTitle(text: string): string {
  const pretty = decodeURIComponent(text).replace(/-/g, ' ');
  return pretty
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

type BreadcrumbsProps = {
  className?: string;
};

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const selected = useSelectedLayoutSegments();
  const segments =
    selected && selected.length
      ? selected
      : pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = breadcrumbLabels[seg] ?? toTitle(seg);
    return { label, href };
  });

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn('leading-none hidden md:block', className)}
    >
      <ol className='flex flex-wrap items-center gap-1.5 leading-none text-sm'>
        <li className='flex items-center gap-1 text-secondary font-medium leading-none'>
          <Home className='h-[1em] w-[1em]' aria-hidden='true' />
          <Link href='/' className='text-[#757575] hover:underline'>
            Strona główna
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <li key={crumb.href} className='flex items-center gap-2 leading-none'>
            <ChevronRight
              className='h-[1em] w-[1em] text-gray-400'
              aria-hidden='true'
            />
            {idx === crumbs.length - 1 ? (
              <span aria-current='page' className='font-bold text-black'>
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className='text-gray-500 font-medium hover:underline'
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
