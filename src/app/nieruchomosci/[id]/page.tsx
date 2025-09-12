import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import Loadable from '@/components/ui/loadable';
import PhotoCarousel from '@/components/ui/photoCarousel';
import { mockedOffer } from '@/app/api/test-offer';
import Image from 'next/image';
import { Play } from 'lucide-react';

type PageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function OfferPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const isLoading = false;

  return (
    <div className='mt-22 mb-14'>
      <Breadcrumbs className='pt-5 pb-5' />

      {/* Top: media gallery placeholder */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] max-w-[1200px] mx-auto'>
        <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
          <Loadable isLoading={isLoading} skeletonClassName='h-[462px] w-full'>
            <PhotoCarousel
              imageClassName='h-[462px]'
              images={mockedOffer.images}
              overlayRoundedBottom
            />
          </Loadable>
        </div>

        <div className='space-y-6'>
          <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
            <Loadable
              isLoading={isLoading}
              skeletonClassName='h-[219px] w-full'
            >
              <Image
                src='/floor-plan.png'
                alt='Floor plan'
                width={424}
                height={220}
                className='h-[219px] w-full'
              />
            </Loadable>
          </div>
          <div className='rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] overflow-hidden'>
            <Loadable
              isLoading={isLoading}
              skeletonClassName='h-[219px] w-full'
            >
              <div className='relative'>
                <Image
                  src={mockedOffer.images[0].urlNormal}
                  width={424}
                  height={220}
                  className='h-[219px] w-full'
                  alt='Virtual tour'
                />
                <div className='absolute inset-0 flex flex-col items-center justify-center bg-[#00000073]'>
                  <Play className='size-10 text-white mb-1' />
                  <span className='text-white font-bold text-sm'>
                    Wirtualny spacer
                  </span>
                </div>
              </div>
            </Loadable>
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className='grid grid-cols-1 gap-6 mt-6 lg:grid-cols-[minmax(0,1fr)_360px] max-w-[1200px] mx-auto'>
        <section className='rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='flex items-center justify-between text-md text-[#212121]'>
            <span>Oferta sprzedaży</span>
            <span>ID: {id}</span>
          </div>
          <h1 className='mt-3 text-[48px]/[56px] font-bold'>
            Mieszkanie, ul. Jana III Sobieskiego, Częstochowa
          </h1>

          <div className='flex justify-between'>
            <div>
              <div className='mt-8 text-green-primary font-black text-5xl/[48px]'>
                550 000 zł
              </div>
              <div className='text-gray-500 text-[20px] mt-1 font-medium'>
                12 310 zł/m²
              </div>
            </div>

            <div className='mt-6 flex flex-col text-sm w-[360px]'>
              <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014]'>
                <div className='text-[#757575]'>Lokalizacja</div>
                <div className='font-bold text-[#212121]'>Częstochowa</div>
              </div>
              <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014]'>
                <div className='text-[#757575]'>Powierzchnia</div>
                <div className='font-bold text-[#212121]'>63 m²</div>
              </div>
              <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014]'>
                <div className='text-[#757575]'>Pokoje</div>
                <div className='font-bold text-[#212121]'>3</div>
              </div>
            </div>
          </div>
        </section>

        <aside className='rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <Loadable
            isLoading={isLoading}
            className='mx-auto size-[104px] rounded-full overflow-hidden'
            skeletonClassName='size-full rounded-full'
          >
            <Image
              src='/agents/jakub.png'
              alt='Agent Kuba'
              width={112}
              height={112}
              className='size-full rounded-full border-4 border-accent p-1'
            />
          </Loadable>
          <div className='mt-4 text-center'>
            <div className='text-xl font-bold'>Jakub Pruszyński</div>
            <div className='text-xs text-[#757575]'>
              Specjalista ds. nieruchomości
            </div>
          </div>
          <div className='mt-4'>
            <Button className='w-full rounded-xl' size='sm' variant='outline'>
              Pokaż numer
            </Button>
          </div>
          <div className='mt-2 text-center'>
            <Button
              variant='ghost'
              size='sm'
              className='text-[#757575] hover:bg-[#F4F4F4] rounded-xl'
            >
              Zobacz profil
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
