'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const navLinks = [
    { href: '/', label: 'Strona Główna' },
    { href: '/nieruchomosci', label: 'Nieruchomości' },
    { href: '/blog', label: 'Blog' },
    { href: '/uslugi', label: 'Usługi' },
    { href: '/o-nas', label: 'O Nas' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <header className='absolute mx-auto inset-x-0 top-6 rounded-2xl flex items-center shadow-[0_8px_40px_rgba(164,167,174,0.12)] h-16 z-50 w-[calc(100%-48px)] bg-white'>
      <div className='w-full flex justify-between pl-6'>
        <Image
          className=''
          src='/sygnet.svg'
          alt='Green House logo'
          width={40}
          height={40}
        />
        <div className='items-center flex gap-2 pr-6'>
          {navLinks.map(link => {
            const isActive =
              mounted &&
              (pathname === link.href || pathname.startsWith(link.href + '/'));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive ? 'bg-[#343434] text-white' : 'hover:bg-[#0000000F]'
                } text-sm font-medium rounded-xl hover:underline px-4 py-2`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
