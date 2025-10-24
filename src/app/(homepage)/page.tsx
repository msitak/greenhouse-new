'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import OfferTile, {
  OfferTileListing,
  OfferTileSkeleton,
} from '@/components/layout/offerTile';
import Hero from '@/components/layout/hero';
import { Button } from '@/components/ui/button';
import Section from '@/components/layout/section';
import TrustSection from '@/components/sections/trustSection';
import PopularCitiesSection from '@/components/sections/popularCitiesSection';
import TestimonialsSection from '@/components/sections/testimonialsSection';
import AboutUsSection from '@/components/sections/aboutUsSection';
// Search fields kept for future use on homepage
import SearchTabs from '@/components/search/SearchTabs';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SKELETONS = Array.from({ length: 6 }, (_, index) => index);

export default function Home() {
  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>(
    'sale'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<OfferTileListing[]>([]);
  const [offersApi, setOffersApi] = useState<CarouselApi | null>(null);
  const [offersIndex, setOffersIndex] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [searchTabsHeight, setSearchTabsHeight] = useState(0);
  const searchTabsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchLatestOffers() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/listings/latest?kind=${transactionType}`
        );

        if (!response.ok) {
          console.error('Failed to load listings:', response.statusText);
          return;
        }

        const json = await response.json();
        if (!isCancelled) {
          setOffers(json.data ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch latest listings:', error);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLatestOffers();

    return () => {
      isCancelled = true;
    };
  }, [transactionType]);

  useEffect(() => {
    if (!offersApi) return;
    setOffersCount(offersApi.scrollSnapList().length);
    const onSelect = () => setOffersIndex(offersApi.selectedScrollSnap());
    onSelect();
    offersApi.on('select', onSelect);
    offersApi.on('reInit', onSelect);
    return () => {
      offersApi.off('select', onSelect);
      offersApi.off('reInit', onSelect);
    };
  }, [offersApi]);

  // Dynamically calculate SearchTabs overflow
  useEffect(() => {
    const calculateOverflow = () => {
      if (!searchTabsRef.current || !heroRef.current) return;

      const searchTabsRect = searchTabsRef.current.getBoundingClientRect();
      const heroRect = heroRef.current.getBoundingClientRect();

      // Calculate how much SearchTabs extends beyond the hero
      const heroBottom = heroRect.bottom;
      const searchTabsBottom = searchTabsRect.bottom;
      const overflow = Math.max(0, searchTabsBottom - heroBottom);

      // Add some extra padding for breathing room (e.g., 48px)
      setSearchTabsHeight(overflow + 48);
    };

    // Calculate on mount and when window resizes
    calculateOverflow();
    window.addEventListener('resize', calculateOverflow);

    // Use ResizeObserver to detect when SearchTabs size changes
    let resizeObserver: ResizeObserver | null = null;
    if (searchTabsRef.current) {
      resizeObserver = new ResizeObserver(calculateOverflow);
      resizeObserver.observe(searchTabsRef.current);
    }

    // Also recalculate after a short delay to account for content loading
    const timer = setTimeout(calculateOverflow, 100);

    return () => {
      window.removeEventListener('resize', calculateOverflow);
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <Section id='hero' ref={heroRef}>
        <Hero
          src='/hero.png'
          alt='Green House'
          overlay
          quality={95}
          fit='cover'
          objectPosition='50% 40%'
          sizes='(min-width: 1280px) 1280px, 100vw'
        >
          <div className='absolute top-[100px] inset-x-0 md:top-[200px] z-10 flex items-center justify-center px-[16px] md:px-[60px]'>
            <div className='text-center font-[family-name:var(--font-montserrat)]'>
              <h1 className='text-white text-[40px]/[48px] md:text-6xl font-semibold'>
                Twoje marzenie, nasz wspólny cel
              </h1>
              <p className='text-white text-[16px]/[24px] max-w-[270px] mx-auto md:max-w-none md:text-xl mt-3'>
                Od mieszkań i domów, po działki i lokale usługowe - pomożemy Ci
                znaleźć Twoją przestrzeń
              </p>
              <div
                ref={searchTabsRef}
                className='mt-20 md:mt-24 mx-auto md:max-w-[872px]'
              >
                <Suspense fallback={null}>
                  <SearchTabs redirectPath='/nieruchomosci' />
                </Suspense>
              </div>
            </div>
          </div>
        </Hero>
      </Section>

      <Section
        id='latest-offers'
        className='mb-12 md:max-w-[1320px] md:mx-auto'
        style={{
          marginTop: searchTabsHeight > 0 ? `${searchTabsHeight}px` : '3rem',
        }}
      >
        <div className='flex justify-between md:flex-row flex-col items-center mb-6 md:mb-4'>
          <h2 className='text-[32px]/[40px] md:text-4xl font-bold mb-4'>
            Najnowsze oferty nieruchomości
          </h2>
          <div className='inline-flex gap-0 items-center rounded-xl justify-center bg-gray-100 p-0'>
            <ToggleGroup
              type='single'
              value={transactionType}
              onValueChange={value => {
                if (value) {
                  setTransactionType(value as typeof transactionType);
                }
              }}
              className='flex items-center'
            >
              <ToggleGroupItem
                value='sale'
                variant='pill'
                className='px-8 py-2'
              >
                Sprzedaż
              </ToggleGroupItem>
              <ToggleGroupItem
                value='rent'
                variant='pill'
                className='px-8 py-2'
              >
                Wynajem
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Mobile slider */}
        <div className='md:hidden full-bleed px-4'>
          <Carousel
            className='w-full'
            setApi={setOffersApi}
            opts={{ loop: false }}
          >
            <CarouselContent viewportClassName='overflow-visible'>
              {(isLoading ? SKELETONS : offers).map((item, idx) => (
                <CarouselItem
                  key={isLoading ? `s-${idx}` : (item as OfferTileListing).id}
                  className='basis-[88%] max-w-[380px]'
                >
                  {isLoading ? (
                    <OfferTileSkeleton />
                  ) : (
                    <OfferTile listing={item as OfferTileListing} />
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className='mt-4 flex items-center justify-center gap-6'>
            <Button
              variant='outline'
              size='icon'
              className='size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]'
              onClick={() => offersApi?.scrollPrev()}
              aria-label='Previous offers'
            >
              <ChevronLeft className='size-6 text-[--color-text-primary]' />
            </Button>
            <div className='flex items-center gap-2'>
              {Array.from({ length: offersCount }).map((_, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${i === offersIndex ? 'bg-[#4FA200]' : 'bg-[#0000000A]'}`}
                />
              ))}
            </div>
            <Button
              variant='outline'
              size='icon'
              className='size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]'
              onClick={() => offersApi?.scrollNext()}
              aria-label='Next offers'
            >
              <ChevronRight className='size-6 text-[--color-text-primary]' />
            </Button>
          </div>
        </div>

        {/* Desktop/tablet grid – unchanged */}
        <div className='hidden md:grid grid-cols-3 gap-4'>
          {isLoading
            ? SKELETONS.map(key => <OfferTileSkeleton key={key} />)
            : offers.map(offer => <OfferTile key={offer.id} listing={offer} />)}
        </div>

        <div className='flex justify-center mt-10'>
          <Link href='/nieruchomosci'>
            <Button>Zobacz oferty</Button>
          </Link>
        </div>
      </Section>

      <Section id='trust' className='my-12'>
        <TrustSection />
      </Section>

      <Section id='popular-cities' className='my-12'>
        <PopularCitiesSection />
      </Section>

      <Section id='testimonials' className='my-12'>
        <TestimonialsSection />
      </Section>

      <Section id='about-us' className='my-12'>
        <AboutUsSection />
      </Section>

      {/* <Section id='articles' className='my-12'>
        <ArticlesSection />
      </Section> */}
    </div>
  );
}
