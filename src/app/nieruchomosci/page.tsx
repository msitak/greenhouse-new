import Image from 'next/image';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import ListingRow from '@/components/listings/ListingRow';
import { mockedOffer } from '@/app/api/test-offer';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/ui/pagination';

export default function Page() {
  const listings = [mockedOffer, mockedOffer, mockedOffer];
  return (
    <div>
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
      <Breadcrumbs className='my-6' />

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-[40px]/[48px] font-bold'>Oferty nieruchomości</h1>
          <p className='text-xl/[48px] text-gray-700'>
            <span className='text-green-primary font-bold'>
              {listings.length} nieruchomości
            </span>{' '}
            na sprzedaż
          </p>
        </div>
        <div className='flex items-center gap-3 self-end'>
          <Button
            variant='outlineContrast'
            size='icon'
            className='rounded-full !w-11 !h-11 '
          >
            <Map className='size-5' />
          </Button>
          <Select defaultValue='newest'>
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
        </div>
      </div>

      <div className='space-y-6 mt-14'>
        {listings.map((l, idx) => (
          <ListingRow
            key={idx}
            listing={l}
            isReservation={idx === 0}
            isSpecial={idx === 1}
          />
        ))}
      </div>

      <div className='mt-8 mb-14 flex justify-center'>
        <Pagination currentPage={1} totalPages={12} />
      </div>
    </div>
  );
}
