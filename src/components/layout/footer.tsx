'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export default function Footer() {
  return (
    <footer className='w-screen bg-[#1E1E1E] text-white full-bleed'>
      <div className='py-10 px-[60px]'>
        <div className='flex items-center justify-between mb-6'>
          <Image
            src='/logo_white.svg'
            alt='Green House'
            width={160}
            height={80}
          />
          <a className='inline-flex'>
            <Button
              variant='outlineContrast'
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Wróć do góry
              <ArrowUp className='size-5' />
            </Button>
          </a>
        </div>
        {/* Separator */}
        <Separator className='my-8 bg-[var(--gray-400)]' />

        {/* Bottom section */}
        <div className='flex justify-between'>
          {/* Brand text and socials */}
          <div className='md:col-span-1'>
            <p className='text-sm text-white/80 max-w-[420px]'>
              Znajdź swoje miejsce z nami. Domy, mieszkania, działki, lokale –
              mamy to, czego szukasz.
            </p>
            <div className='flex items-center gap-4 mt-6'>
              <a
                href='https://facebook.com/greenhousenieruchomosci'
                target='_blank'
                rel='noreferrer'
                aria-label='Facebook'
                className='inline-flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'
              >
                <Facebook className='size-4' />
              </a>
              <a
                href='https://instagram.com/greenhousenieruchomosci'
                target='_blank'
                rel='noreferrer'
                aria-label='Instagram'
                className='inline-flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'
              >
                <Instagram className='size-4' />
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Adres</h3>
            <p className='text-sm text-white/85'>ul. Gen. Dąbrowskiego 7/1</p>
            <p className='text-sm text-white/85'>42-202 Częstochowa</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Kontakt</h3>
            <p className='text-sm text-white/85'>
              <a href='tel:+48667220011' className='hover:underline'>
                667 220 011
              </a>
            </p>
            <p className='text-sm text-white/85'>
              <a href='mailto:bok@bngh.pl' className='hover:underline'>
                bok@bngh.pl
              </a>
            </p>
          </div>

          {/* Links and socials */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Linki</h3>
            <Link
              href='/cookies'
              className='text-sm text-white/85 hover:underline'
            >
              Pliki Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
