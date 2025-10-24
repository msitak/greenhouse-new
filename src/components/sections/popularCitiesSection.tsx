'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type City = {
  name: string;
  offersCount: number;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

type CityCount = {
  city: string;
  count: number;
};

const citiesConfig: Omit<City, 'offersCount'>[] = [
  {
    name: 'Częstochowa',
    href: '/nieruchomosci?miasto=czestochowa',
    imageSrc: '/czestochowa.png',
    imageAlt: 'Częstochowa',
  },
  {
    name: 'Katowice',
    href: '/nieruchomosci?miasto=katowice',
    imageSrc: '/katowice.png',
    imageAlt: 'Katowice',
  },
  {
    name: 'Gliwice',
    href: '/nieruchomosci?miasto=gliwice',
    imageSrc: '/gliwice.png',
    imageAlt: 'Gliwice',
  },
];

export default function PopularCitiesSection() {
  const [cities, setCities] = useState<City[]>(
    citiesConfig.map(city => ({ ...city, offersCount: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCityCounts() {
      try {
        const response = await fetch('/api/listings/cities-count');
        if (!response.ok) {
          console.error('Failed to fetch city counts');
          return;
        }

        const json = await response.json();
        const cityCounts: CityCount[] = json.data || [];

        // Map counts to cities
        const updatedCities = citiesConfig.map(cityConfig => {
          const cityData = cityCounts.find(
            cc => cc.city?.toLowerCase() === cityConfig.name.toLowerCase()
          );
          return {
            ...cityConfig,
            offersCount: cityData?.count || 0,
          };
        });

        setCities(updatedCities);
      } catch (error) {
        console.error('Failed to fetch city counts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCityCounts();
  }, []);
  return (
    <section
      aria-labelledby='popular-cities-heading'
      className='max-w-[1320px] mx-auto'
    >
      <div className='text-center mb-8'>
        <h2
          id='popular-cities-heading'
          className='text-[40px]/[48px] md:text-5xl font-bold tracking-tight'
        >
          Najpopularniejsze miasta
        </h2>
        <p className='mt-3 text-gray-500'>
          Szukasz mieszkania, domu lub działki w sprawdzonym miejscu? Sprawdź
          nasze najpopularniejsze lokalizacje.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {cities.map(city => (
          <Link
            key={city.name}
            href={city.href}
            className='group block rounded-[24px] bg-white shadow-[0_8px_40px_rgba(164,167,174,0.12)] overflow-hidden'
          >
            <div className='relative'>
              <Image
                src={city.imageSrc}
                alt={city.imageAlt}
                width={672}
                height={420}
                className='w-full h-auto object-cover'
              />
              {!isLoading && city.offersCount > 0 && (
                <span className='absolute top-4 right-4 text-xs font-medium text-white bg-black/80 rounded-full px-3 py-1'>
                  {city.offersCount} ofert
                </span>
              )}
              <span className='absolute bottom-4 left-4 bg-white text-black text-[18px] leading-[22px] font-bold rounded-md px-4 py-2 shadow-sm'>
                {city.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
