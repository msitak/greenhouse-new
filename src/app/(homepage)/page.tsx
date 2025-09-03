'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useState } from 'react';
import OfferTile from '@/components/layout/offerTile';
import Hero from '@/components/layout/hero';
import { Button } from '@/components/ui/button';
import Section from '@/components/layout/section';
import TrustSection from '@/components/sections/trustSection';
import PopularCitiesSection from '@/components/sections/popularCitiesSection';
import TestimonialsSection from '@/components/sections/testimonialsSection';
import AboutUsSection from '@/components/sections/aboutUsSection';
import ArticlesSection from '@/components/sections/articlesSection';
import { LocationCombobox } from '../../components/search/LocationCombobox';
import { AreaRangeField } from '../../components/search/AreaRangeField';
import { PriceRangeField } from '../../components/search/PriceRangeField';
import { LocationValue } from '../../lib/location/types';

export default function Home() {
  const [transactionType, setTransactionType] = useState('sale');
  const [area, setArea] = useState<[number | null, number | null]>([100, 200]);
  const [price, setPrice] = useState<[number | null, number | null]>([
    100_000, 200_000,
  ]);
  const [location, setLocation] = useState<LocationValue>();

  // const handleTypeChange = (newType: string) => {
  //   if (newType) {
  //     // Zabezpieczenie, aby zawsze była wybrana jakaś opcja
  //     setTransactionType(newType);
  //   }
  // };

  return (
    <div>
      <Section id='hero'>
        <Hero src='/test-image.jpg' alt='Green House' overlay>
          <div className='absolute top-[200px] inset-0 z-10 flex items-center justify-center px-[60px]'>
            <div className='text-center font-[family-name:var(--font-montserrat)]'>
              <h1 className='text-white text-4xl md:text-6xl font-semibold'>
                Znajdź swoje miejsce z nami.
              </h1>
              <p className='text-white text-lg md:text-xl mt-3'>
                Domy, mieszkania, działki, lokale - mamy to, czego szukasz.
              </p>
              <div
                className='mt-6 mx-auto h-[250px] w-[800px] rounded-2xl bg-white shadow-[0_5px_39.3px_0_rgba(0,0,0,0.08)]'
                aria-hidden='true'
                style={{ minHeight: 292 }}
              />
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

      <Section id='latest-offers' className='mt-12 mb-12'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-4xl font-bold mb-4'>
            Najnowsze oferty nieruchomości
          </h2>
          <div className='inline-flex gap-0 items-center rounded-xl justify-center bg-gray-100 p-0'>
            <br />
            <ToggleGroup
              type='single'
              value={transactionType}
              className='flex items-center' // Używamy flex i space-x do ułożenia przycisków
            >
              <ToggleGroupItem
                value='sprzedaz'
                variant='pill' // Używamy naszego nowego wariantu
                className='px-8 py-2' // Dostosuj padding do swojego gustu
              >
                Sprzedaż
              </ToggleGroupItem>
              <ToggleGroupItem
                value='wynajem'
                variant='pill' // Używamy naszego nowego wariantu
                className='px-8 py-2' // Dostosuj padding do swojego gustu
              >
                Wynajem
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className='grid grid-flow-col grid-rows-2 gap-4'>
          <OfferTile />
          <OfferTile />
          <OfferTile />
          <OfferTile />
          <OfferTile />
          <OfferTile />
        </div>

        <div className='flex justify-center mt-10'>
          <Button>Wszystkie oferty</Button>
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

      <Section id='articles' className='my-12'>
        <ArticlesSection />
      </Section>
    </div>
  );
}
