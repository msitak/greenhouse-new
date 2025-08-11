import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='w-screen bg-[#1E1E1E] text-white full-bleed'>
      <div className='py-10 px-[60px]'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-4 items-start'>
          {/* Logo and brand */}
          <div className='md:col-span-1 flex items-center gap-4'>
            <Image src='/logo.svg' alt='Green House' width={160} height={80} className='invert' />
          </div>

          {/* Address */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Adres</h3>
            <p className='text-sm text-white/85'>Lokal 1</p>
            <p className='text-sm text-white/85'>ul. Gen. Dąbrowskiego 7</p>
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
          <div className='flex flex-col gap-4'>
            <div>
              <h3 className='text-lg font-semibold mb-3'>Linki</h3>
              <Link href='/cookies' className='text-sm text-white/85 hover:underline'>
                Pliki Cookies
              </Link>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-3'>Social media</h3>
              <div className='flex items-center gap-4'>
                <a
                  href='https://facebook.com'
                  target='_blank'
                  rel='noreferrer'
                  aria-label='Facebook'
                  className='inline-flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'
                >
                  <Facebook className='size-4' />
                </a>
                <a
                  href='https://instagram.com'
                  target='_blank'
                  rel='noreferrer'
                  aria-label='Instagram'
                  className='inline-flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'
                >
                  <Instagram className='size-4' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='border-t border-white/10'>
        <div className='py-4 px-[60px] text-center text-xs text-white/70'>
          made with 💚 by Green House © {new Date(Date.now()).getFullYear()}
        </div>
      </div>
    </footer>
  );
}


