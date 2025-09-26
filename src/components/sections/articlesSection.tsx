'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  imageAlt: string;
  author: string;
  date: string;
};

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

function AuthorChip({ name }: { name: string }) {
  return (
    <span className='absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm'>
      <span className='inline-flex size-5 items-center justify-center rounded-full bg-green-primary/15 text-green-primary font-bold'>
        {name.charAt(0)}
      </span>
      {name}
    </span>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <div className='rounded-2xl bg-white shadow-[0_8px_40px_rgba(164,167,174,0.12)] overflow-hidden'>
      <div className='relative'>
        <Image
          src={article.imageSrc}
          alt={article.imageAlt}
          width={672}
          height={420}
          className='w-full h-auto object-cover'
        />
        <AuthorChip name={article.author} />
      </div>
      <div className='p-4'>
        <h3 className='font-bold text-lg leading-tight mb-1 line-clamp-2 min-h-[2.8rem]'>
          {article.title}
        </h3>
        <p className='text-sm text-gray-600 leading-6 line-clamp-3 min-h-[4.5rem] mb-3'>
          {article.excerpt}
        </p>
        <span className='text-xs text-gray-400'>{article.date}</span>
      </div>
    </div>
  );
}

export default function ArticlesSection() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <section aria-labelledby='articles-heading'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h2
            id='articles-heading'
            className='text-4xl font-bold tracking-tight'
          >
            Nasze artykuły
          </h2>
          <p className='mt-2 text-gray-500 text-sm'>
            Czytaj praktyczne poradniki i analizy rynku nieruchomości.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            className='size-8 rounded border border-[#00000026] text-[#1E1E1E] hover:bg-white hover:text-[#1E1E1E] hover:border-[#00000026]'
            onClick={() => api?.scrollPrev()}
            disabled={!canPrev}
            aria-label='Poprzednie artykuły'
          >
            <ChevronLeft className='size-6 text-[#1E1E1E]' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='size-8 rounded border border-[#00000026] text-[#1E1E1E] hover:bg-white hover:text-[#1E1E1E] hover:border-[#00000026]'
            onClick={() => api?.scrollNext()}
            disabled={!canNext}
            aria-label='Następne artykuły'
          >
            <ChevronRight className='size-6 text-[#1E1E1E]' />
          </Button>
        </div>
      </div>

      <div className='bleed-right'>
        <Carousel setApi={setApi} opts={{ align: 'start' }}>
          <CarouselContent>
            {articles.map(a => (
              <CarouselItem
                key={a.id}
                className='basis-[300px] sm:basis-[360px] lg:basis-[420px] mb-20'
              >
                <ArticleCard article={a} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='hidden' />
          <CarouselNext className='hidden' />
        </Carousel>
      </div>
    </section>
  );
}
