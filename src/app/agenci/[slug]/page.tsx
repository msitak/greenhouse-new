import { AtSign, Facebook, Phone } from 'lucide-react';
import Image from 'next/image';
import OfferTile from '@/components/layout/offerTile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ArticleCard,
  type Article,
} from '@/components/sections/articlesSection';

const articles: Article[] = [
  {
    id: 'a1',
    title: 'Bloki z wielkiej płyty – Czy warto inwestować w mieszkania?',
    excerpt:
      'Bloki z wielkiej płyty to niezwykle ciekawe nieruchomości wielorodzinne. Choćby zbudowane były one z myślą o szybkim udostępnieniu lokali mieszkaniowych dla większości…',
    imageSrc: '/test-image.jpg',
    imageAlt: 'City skyline',
    author: 'Anna',
    date: '17 lipca 2025',
  },
  {
    id: 'a2',
    title: 'Zarządzanie najmem – idealne narzędzie dla inwestorów',
    excerpt:
      'Jak skutecznie zarządzać najmem, aby minimalizować ryzyko i zwiększać przychody? Praktyczne wskazówki i narzędzia…',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Katowice Spodek',
    author: 'Anna',
    date: '17 lipca 2025',
  },
  {
    id: 'a3',
    title: 'Jak urządzić mieszkanie pod wynajem? Poradnik krok po kroku',
    excerpt:
      'Od doboru mebli, przez dodatki, aż po zdjęcia oferty. Sprawdź, jak przygotować mieszkanie, które przyciągnie najemców…',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Warsaw old photo',
    author: 'Anna',
    date: '17 lipca 2025',
  },
  {
    id: 'a4',
    title: 'Dom modułowy całoroczny – koszty, możliwości, ceny',
    excerpt:
      'Dom modułowy to szybka ścieżka do własnych czterech kątów. Porównujemy rozwiązania i budżety…',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Colorful houses',
    author: 'Anna',
    date: '17 lipca 2025',
  },
];

export default function AgentPage() {
  return (
    <div>
      <div className='full-bleed relative h-[312px] w-full mb-[300px]'>
        <Image
          src='/test-image.jpg'
          alt='Green House'
          fill
          className='object-cover'
        />

        <div className='absolute inset-0 bg-[#000000A6]' />
        <div className='absolute inset-0 top-[168px] w-[1138px] mx-auto'>
          <div className='flex gap-10 w-full'>
            <div className='flex justify-center items-center p-3 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] rounded-2xl'>
              <Image
                src='/agents/full/jakub.jpg'
                alt='Jakub Pruszyński'
                width={288}
                height={364}
                className='w-[288px] rounded-2xl object-cover'
              />
            </div>
            <div className='flex flex-col gap-2 w-full mt-6'>
              <h1 className='text-white font-bold text-5xl/11'>
                Jakub Pruszyński
              </h1>
              <div className='flex gap-8 text-white'>
                <div className='flex items-center gap-2'>
                  <Phone className='size-4' />
                  <span>514 620 940</span>
                </div>
                <div className='flex items-center gap-2'>
                  <AtSign className='size-4' />
                  <span>jakub.pruszynski@bngh.pl</span>
                </div>
              </div>
              <div className='mt-14'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-black font-bold text-3xl'>Poznaj mnie</h2>
                  <Facebook className='size-8' />
                </div>
                <p className='text-[#818181] text-base mt-4'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className='w-[1138px] mx-auto'>
        <h2 className='text-black font-bold mb-10 text-3xl'>
          Moje nieruchomości
        </h2>
        <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className='w-[358px]'>
              <OfferTile key={idx} listing={null} />
            </div>
          ))}
        </div>
        <h2 className='text-black font-bold mt-14 mb-10 text-3xl'>
          Moje artykuły
        </h2>
        <div className='mr-[-151px]'>
          <Carousel opts={{ align: 'start' }}>
            <CarouselContent>
              {articles.map(a => (
                <CarouselItem key={a.id} className='basis-[370px] mb-20'>
                  <ArticleCard article={a} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='hidden' />
            <CarouselNext className='hidden' />
          </Carousel>
        </div>
      </main>
    </div>
  );
}
