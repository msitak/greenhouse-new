import Image from 'next/image';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import ListingRow from '@/components/listings/ListingRow';
import { mockedOffer } from '@/app/api/test-offer';
import { Button } from '@/components/ui/button';
import { ChevronDown, Map } from 'lucide-react';

export default function Page() {
  const listings = [mockedOffer, mockedOffer, mockedOffer];
  return (
    <div className='space-y-8'>
      <div className='full-bleed relative h-[525px] overflow-hidden'>
        <Image
          src='/test-image.jpg'
          alt='Okładka nieruchomości'
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
        <div className='absolute inset-0 bg-[#00000080]' />
        <div className='absolute inset-0 z-10 flex items-center justify-center px-[60px]'>
          <div className='text-center'>
            <h1 className='text-white text-4xl md:text-5xl font-extrabold'>
              Znajdź swoje miejsce z nami.
            </h1>
            <p className='mt-3 text-white text-lg md:text-xl'>
              Domy, mieszkania, działki, lokale - mamy to, czego szukasz.
            </p>
          </div>
        </div>
      </div>
      <Breadcrumbs />

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl md:text-5xl font-extrabold'>
            Oferty nieruchomości
          </h1>
          <p className='mt-2 text-gray-700'>
            <span className='text-green-primary font-bold'>
              {listings.length}
            </span>{' '}
            nieruchomości na sprzedaż
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            className='size-10 rounded-full'
          >
            <Map className='size-5' />
          </Button>
          <Button
            variant='outline'
            className='rounded-full px-4 py-2 text-sm md:text-base flex items-center gap-2'
          >
            Sortowanie od najnowszych
            <ChevronDown className='size-4' />
          </Button>
        </div>
      </div>

      <div className='space-y-6'>
        {listings.map((l, idx) => (
          <ListingRow key={idx} listing={l} isReservation={idx === 0} />
        ))}
      </div>
    </div>
  );
}
