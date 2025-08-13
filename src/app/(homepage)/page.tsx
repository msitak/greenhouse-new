'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useState } from 'react';
import OfferTile from '@/components/layout/offerTile';
import Hero from '@/components/layout/hero';
import PropertySearchForm from '@/components/layout/propertySearchForm';
import { Button } from '@/components/ui/button';
import Section from '@/components/layout/section';
import TrustSection from '@/components/sections/trustSection';
import PopularCitiesSection from '@/components/sections/popularCitiesSection';
import TestimonialsSection from '@/components/sections/testimonialsSection';
import AboutUsSection from '@/components/sections/aboutUsSection';
import ArticlesSection from '@/components/sections/articlesSection';

export default function Home() {
  const [transactionType, setTransactionType] = useState('wynajem');

  const handleTypeChange = (newType: string) => {
    if (newType) {
      // Zabezpieczenie, aby zawsze była wybrana jakaś opcja
      setTransactionType(newType);
    }
  };

  return (
    <div className='space-y-20'>
      <Section id='hero'>
        <Hero src='/test-image.jpg' alt='Green House' className='mt-[18px]' />
      </Section>

      <Section id='property-search'>
        <PropertySearchForm />
      </Section>

      <Section id='latest-offers'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-4xl font-bold mb-4'>
            Najnowsze oferty nieruchomości
          </h2>
          <div className='inline-flex gap-0 items-center rounded-xl justify-center bg-gray-100 p-0'>
            <br />
            <ToggleGroup
              type='single'
              value={transactionType}
              onValueChange={handleTypeChange}
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
      </Section>

      <Section id='all-offers'>
        <div className='flex justify-center'>
          <Button>Wszystkie oferty</Button>
        </div>
      </Section>

      <TrustSection />

      <Section id='popular-cities'>
        <PopularCitiesSection />
      </Section>

      <Section id='testimonials'>
        <TestimonialsSection />
      </Section>

      <Section id='about-us'>
        <AboutUsSection />
      </Section>

      <Section id='articles'>
        <ArticlesSection />
      </Section>
    </div>
  );
}
