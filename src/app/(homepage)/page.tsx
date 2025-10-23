'use client';

import { useEffect, useState } from 'react';
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

const SKELETONS = Array.from({ length: 6 }, (_, index) => index);

export default function Home() {
  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>(
    'sale'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<OfferTileListing[]>([]);

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

  return (
    <div>
      <Section id='hero'>
        <Hero
          src='/hero.png'
          alt='Green House'
          overlay
          quality={95}
          fit='cover'
          objectPosition='50% 40%'
          sizes='(min-width: 1280px) 1280px, 100vw'
        >
          <div className='absolute top-[100px] inset-0 z-10 flex items-center justify-center px-[60px]'>
            <div className='text-center font-[family-name:var(--font-montserrat)]'>
              <h1 className='text-white text-4xl md:text-6xl font-semibold'>
                Twoje marzenie, nasz wspólny cel
              </h1>
              <p className='text-white text-lg md:text-xl mt-3'>
                Od mieszkań i domów, po działki i lokale usługowe - pomożemy Ci
                znaleźć Twoją przestrzeń
              </p>
              <div className='mt-24 mx-auto max-w-[872px]'>
                <SearchTabs redirectPath='/nieruchomosci' />
              </div>
            </div>
          </div>
        </Hero>
      </Section>

      {/* <LocationCombobox
        onChange={setLocation}
        value={location}
        placeholder='Wybierz lokalizację'
      />

      <AreaRangeField
        id='area-range'
        value={area}
        onChange={setArea}
        updateStrategy='throttle'
      />

      <PriceRangeField
        id='price-range'
        value={price}
        onChange={setPrice}
        updateStrategy='throttle'
        dealType={'sale'}
      /> */}

      <Section
        id='latest-offers'
        className='mt-12 mb-12 max-w-[1320px] mx-auto'
      >
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-[40px] font-bold mb-4'>
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

        <div className='grid grid-cols-3 gap-4'>
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
