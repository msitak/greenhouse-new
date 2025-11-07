'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // Lock scroll when mobile menu is open (iOS-safe)
  React.useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = window.scrollY || 0;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/', label: 'Strona Główna' },
    { href: '/nieruchomosci', label: 'Nieruchomości' },
    { href: '/blog', label: 'Blog' },
    { href: '/uslugi', label: 'Usługi' },
    { href: '/o-nas', label: 'O Nas' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <>
      {/* Mobile header */}
      <header className='lg:hidden bg-white shadow-[0_8px_40px_rgba(164,167,174,0.12)] md:mb-6 mx-[-16px]'>
        <div className='flex items-center justify-between p-4'>
          <Image
            src='/logo.svg'
            alt='Green House logo'
            width={120}
            height={40}
          />
          <button
            aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
            className='p-2'
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? (
              <X className='size-6 text-black' />
            ) : (
              <Menu className='size-6 text-black' />
            )}
          </button>
        </div>
        {mobileOpen && (
          <div className='fixed inset-x-0 top-[72px] bottom-0 z-[60] bg-white lg:hidden animate-in fade-in duration-200'>
            <nav className='h-full flex flex-col items-center justify-center gap-6 animate-in slide-in-from-top-4 duration-300'>
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className='text-[#212121] text-[32px]/[40px] font-regular animate-in fade-in-0 slide-in-from-bottom-2 duration-300'
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href='/wycena' onClick={() => setMobileOpen(false)}>
                <Button
                  variant='outline'
                  className='rounded-xl px-5 py-3 text-base'
                >
                  Wyceń nieruchomość
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Desktop header */}
      <header className='hidden lg:flex absolute mx-auto inset-x-0 top-6 rounded-2xl items-center shadow-[0_8px_40px_rgba(164,167,174,0.12)] h-16 z-50 w-[calc(100%-48px)] bg-white'>
        <div className='w-full flex justify-between pl-6'>
          <Image
            className=''
            src='/logo.svg'
            alt='Green House logo'
            width={80}
            height={80}
          />
          <div className='items-center flex gap-2 pr-6'>
            {navLinks.map(link => {
              const isActive =
                mounted &&
                (pathname === link.href ||
                  pathname.startsWith(link.href + '/'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    isActive
                      ? 'bg-[#343434] text-white'
                      : 'hover:bg-[#0000000F]'
                  } text-sm font-medium rounded-xl hover:underline px-4 py-2`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href='/wycena'>
              <Button variant='outline' className='rounded-xl h-10 px-5'>
                Wyceń nieruchomość
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
