import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function ValuationCta() {
  return (
    <section className='px-4 md:px-8 max-w-[1440px] mx-auto my-10 md:my-14'>
      <div className='relative h-[260px] md:h-[320px] rounded-2xl overflow-hidden shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
        <Image
          src='/services-hero.png'
          alt='Zespół podczas prezentacji nieruchomości'
          fill
          className='object-cover'
          style={{ objectPosition: '50% 20%' }}
          sizes='(min-width: 1024px) 1200px, 100vw'
          priority={false}
        />
        <div className='absolute inset-0 bg-black/45' />

        <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6'>
          <h3 className='text-white text-[28px]/[36px] md:text-[40px]/[48px] font-extrabold max-w-[920px]'>
            Wyceń swoją nieruchomość i bądź krok bliżej udanej sprzedaży
          </h3>
          <div className='mt-6'>
            <Button
              asChild
              className='px-6 py-3 text-[14px]/[20px] font-medium'
            >
              <a href='#valuation-hero'>Wycena nieruchomości</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
