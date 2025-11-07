'use client';

import React from 'react';
import Script from 'next/script';
import Hero from '@/components/layout/hero';
import { Button } from '@/components/ui/button';
import { ValuationStepper } from '@/components/valuation/ValuationStepper';
import type { ValuationFormData } from '@/components/valuation/ValuationStepper';
import ValuationBenefits from '@/components/sections/valuationBenefits';
import ValuationHowItWorks from '@/components/sections/valuationHowItWorks';
import ValuationFaq from '@/components/sections/valuationFaq';
import ValuationCta from '@/components/sections/valuationCta';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  const [consent, setConsent] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  const handleValuationSubmit = async (values: ValuationFormData) => {
    const payload = values;
    // Log all values in JSON format
    console.log('Valuation form submit:', JSON.stringify(payload, null, 2));
    // Keep API echo for now
    await fetch('/api/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSuccess(true);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`}
        strategy='beforeInteractive'
      />
      <div className='mb-0' id='valuation-hero'>
        <Hero
          src='/valuation-hero.png'
          alt='Green House – wycena nieruchomości'
          overlay
          overlayColor='#00000040'
          quality={100}
          fit='cover'
          objectPosition='50% 38%'
          sizes='(min-width: 1280px) 1280px, 100vw'
          className='full-bleed p-0!'
          innerClassName='md:rounded-none md:overflow-visible'
        >
          <div className='absolute inset-x-0 top-[100px] md:top-[200px] z-10 flex items-start justify-center px-4 md:px-[60px]'>
            <div className='w-full max-w-[1000px] text-center'>
              <h1 className='text-white text-[36px]/[44px] md:text-[56px]/[64px] font-semibold'>
                Wyceń swoje mieszkanie
              </h1>
              <p className='mt-3 text-white text-[14px]/[22px] md:text-[16px]/[24px]'>
                Uzupełnij dane a my wycenimy za darmo twoje mieszkanie w
                Częstochowie.
              </p>

              <div className='mt-16 flex justify-center'>
                <div className='w-full max-w-[540px] rounded-2xl bg-white p-5 md:p-8 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
                  {!success && (
                    <h2 className='text-[22px]/[28px] md:text-[32px]/[40px] font-bold text-[#212121] text-left mb-6'>
                      Poznaj wartość <br /> swojego mieszkania
                    </h2>
                  )}
                  <div className='mt-6'>
                    {success ? (
                      <div className='flex flex-col items-center text-center'>
                        <Image
                          src='/valuation-success.png'
                          alt='Sukces'
                          width={160}
                          height={160}
                          priority
                        />
                        <h3 className='mt-4 text-[28px]/[36px] md:text-[36px]/[44px] font-bold text-[#212121]'>
                          Gotowe!
                        </h3>
                        <p className='mt-3 text-[#6F6F6F] text-[14px]/[22px] md:text-[16px]/[24px] max-w-[420px]'>
                          Twój formularz już do nas trafił. Otrzymasz raport z
                          wyceną swojego mieszkania tak szybko jak to możliwe!
                        </p>
                        <Button
                          asChild
                          className='mt-6 w-full h-12 text-[14px]/[20px] font-medium md:w-auto px-6'
                        >
                          <Link href='/'>Przejdź na stronę główną</Link>
                        </Button>
                      </div>
                    ) : (
                      <ValuationStepper
                        consent={consent}
                        onConsentChange={setConsent}
                        onSubmit={handleValuationSubmit}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Hero>
        <ValuationBenefits />
        <ValuationHowItWorks />
        <ValuationFaq />
        <ValuationCta />
      </div>
    </>
  );
}
