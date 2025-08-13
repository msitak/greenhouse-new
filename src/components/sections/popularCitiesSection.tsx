import Image from 'next/image';
import Link from 'next/link';

type City = {
  name: string;
  offersCount: number;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const cities: City[] = [
  {
    name: 'Częstochowa',
    offersCount: 19,
    href: '/nieruchomosci?miasto=czestochowa',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Częstochowa',
  },
  {
    name: 'Katowice',
    offersCount: 24,
    href: '/nieruchomosci?miasto=katowice',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Katowice',
  },
  {
    name: 'Gliwice',
    offersCount: 9,
    href: '/nieruchomosci?miasto=gliwice',
    imageSrc: '/test-image.jpg',
    imageAlt: 'Gliwice',
  },
];

export default function PopularCitiesSection() {
  return (
    <section aria-labelledby='popular-cities-heading'>
      <div className='text-center mb-8'>
        <h2
          id='popular-cities-heading'
          className='text-4xl font-bold tracking-tight'
        >
          Najpopularniejsze miasta
        </h2>
        <p className='mt-3 text-gray-500'>
          Szukasz mieszkania, domu lub działki w sprawdzonym miejscu? Sprawdź
          najpopularniejsze lokalizacje w Polsce.
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
              <span className='absolute top-4 right-4 text-xs font-medium text-white bg-black/80 rounded-full px-3 py-1'>
                {city.offersCount} ofert
              </span>
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
