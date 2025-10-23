'use client';

import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Handshake } from 'lucide-react';
import { Search } from 'lucide-react';
import { MessagesSquare } from 'lucide-react';

type Slide = {
  title: string;
  subtitle: string;
  copy: string;
  imageSrc: string;
  imageAlt: string;
  icon: React.ReactNode;
};

const slides: Slide[] = [
  {
    title: 'Twoje Bezpieczeństwo to Nasz Priorytet',
    subtitle: 'Pełne Bezpieczeństwo Transakcji',
    copy: 'Jesteśmy Twoim strażnikiem w świecie skomplikowanych formalności. Bierzemy na siebie pełną odpowiedzialność za każdy etap transakcji – od weryfikacji stanu prawnego nieruchomości, po przygotowanie bezpiecznej umowy. Z nami masz pewność, że Twój interes jest chroniony.',
    imageSrc: '/usp-2.png',
    icon: <ShieldCheck color='#4FA200' size={40} fill='#4FA2001E' />,
    imageAlt: 'Handshake in meeting',
  },
  {
    title: 'Dane, Nie Domyły. Strategia, Nie Przypadek',
    subtitle: 'Ekspertyza i Skuteczność Oparta na Danych',
    copy: 'Nie zgadujemy. Każdą decyzję – od wyceny, przez strategię marketingową, aż po negocjacje – opieramy na twardych danych rynkowych i najnowszych technologiach. Dzięki temu maksymalizujemy Twój zysk i oszczędzamy Twój cenny czas.',
    imageSrc: '/usp-3.png',
    icon: <Search color='#4FA200' size={40} fill='#4FA2001E' />,
    imageAlt: 'Consultation with clients',
  },
  {
    title: 'Pomagamy, a Nie Sprzedajemy',
    subtitle: 'Partnerskie Doradztwo, Nie Sprzedaż',
    copy: 'Naszym celem jest Twój sukces, a nie nasza prowizja. Działamy jak osobiści doradcy – słuchamy, analizujemy Twoją sytuację i szukamy najlepszych rozwiązań, nawet jeśli oznacza to odradzenie transakcji. Jesteśmy po Twojej stronie, grając z Tobą do jednej bramki.',
    imageSrc: '/usp-4.png',
    icon: <MessagesSquare color='#4FA200' size={40} fill='#4FA2001E' />,
    imageAlt: 'Documents review on desk',
  },
  {
    title: 'To Czego Potrzebujesz w Jednym Miejscu',
    subtitle: 'Kompleksowe Wsparcie od A do Z',
    copy: 'Transakcja to nie tylko oferta. Dzięki naszej sieci zaufanych partnerów, zapewniamy pełne wsparcie – od uzyskania najlepszego kredytu hipotecznego, przez współpracę ze sprawdzonymi ekipami remontowymi, aż po pomoc prawną i notarialną. Z nami cały proces jest prostszy.',
    imageSrc: '/usp-1.png',
    icon: <Handshake color='#4FA200' size={40} fill='#4FA2001E' />,
    imageAlt: 'Team celebrating success',
  },
];

export default function TrustSection() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(slides.length);

  useEffect(() => {
    if (!api) return;
    setSlideCount(api.scrollSnapList().length);
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <section id='why-trust-us' className='full-bleed'>
      <div className='flex flex-col items-center text-center mb-8'>
        <h2 className='text-5xl font-bold'>Dlaczego Warto Nam Zaufać?</h2>
        <p className='mt-3 max-w-[760px] text-gray-500'>
          Od pierwszej rozmowy po podpisanie umowy - jesteśmy z Tobą na każdym
          etapie. Łączymy doświadczenie, znajomość rynku i indywidualne
          podejście, by każda transakcja była pewna i bezproblemowa.
        </p>
      </div>

      <Carousel className='w-full' setApi={setApi} opts={{ loop: true }}>
        <CarouselContent viewportClassName='overflow-visible'>
          {slides.map((slide, index) => (
            <CarouselItem
              key={index}
              className='basis-[88%] md:basis-[82%] lg:basis-[78%] max-w-[1096px]'
            >
              <div className='rounded-[12px] mx-auto shadow-[0_8px_40px_rgba(164,167,174,0.12)] bg-white overflow-hidden max-h-[500px]'>
                <div className='grid grid-cols-1 lg:grid-cols-[60%_40%]'>
                  <div className='relative h-[320px] md:h-[420px] lg:h-[500px]'>
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      fill
                      className='object-cover'
                      sizes='(min-width: 1024px) 50vw, 100vw'
                    />
                  </div>
                  <div className='p-8 md:p-10 lg:p-12 flex flex-col justify-center'>
                    {slide.icon}
                    <span className='text-xs text-gray-500 mt-5 mb-1'>
                      {slide.subtitle}
                    </span>
                    <h3 className='text-[28px]/[32px] font-bold mb-6 tracking-tighter'>
                      {slide.title}
                    </h3>
                    <p className='text-gray-600 leading-relaxed text-sm'>
                      {slide.copy}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className='mt-8 flex items-center justify-center gap-6'>
        <Button
          variant='outline'
          size='icon'
          className='size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]'
          onClick={() => api?.scrollPrev()}
          aria-label='Previous slide'
        >
          <ChevronLeft className='size-6 text-[--color-text-primary]' />
        </Button>

        <div className='flex items-center gap-2'>
          {Array.from({ length: slideCount }).map((_, index) => (
            <button
              type='button'
              key={index}
              aria-label={`Przejdź do slajdu ${index + 1}`}
              aria-current={index === selectedIndex}
              onClick={() => api?.scrollTo(index)}
              className={`rounded-full cursor-pointer outline-none focus-visible:ring-[2px] focus-visible:ring-[#00000026] w-3 h-3 ${
                index === selectedIndex ? 'bg-[#4FA200]' : 'bg-[#0000000A]'
              }`}
            />
          ))}
        </div>

        <Button
          variant='outline'
          size='icon'
          className='size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]'
          onClick={() => api?.scrollNext()}
          aria-label='Next slide'
        >
          <ChevronRight className='size-6 text-[--color-text-primary]' />
        </Button>
      </div>
    </section>
  );
}
