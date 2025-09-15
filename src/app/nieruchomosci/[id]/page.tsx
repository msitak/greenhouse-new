import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import Loadable from '@/components/ui/loadable';
import PhotoCarousel from '@/components/ui/photoCarousel';
import { mockedOffer } from '@/app/api/test-offer';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HtmlContent from '@/components/HtmlContent';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          <div className='flex items-center justify-between text-md text-primary'>
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
                <div className='text-secondary'>Lokalizacja</div>
                <div className='font-bold text-primary'>Częstochowa</div>
              </div>
              <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014]'>
                <div className='text-secondary'>Powierzchnia</div>
                <div className='font-bold text-primary'>63 m²</div>
              </div>
              <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014]'>
                <div className='text-secondary'>Pokoje</div>
                <div className='font-bold text-primary'>3</div>
              </div>
            </div>
          </div>
        </section>

        <aside className='sticky top-4 rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
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
            <div className='text-xs text-[--color-text-secondary]'>
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
              className='text-[--color-text-secondary] hover:bg-[#F4F4F4] rounded-xl'
            >
              Zobacz profil
            </Button>
          </div>
        </aside>

        <Tabs defaultValue='info'>
          <TabsList>
            <TabsTrigger value='info'>Informaje</TabsTrigger>
            <TabsTrigger value='location'>Lokalizacja</TabsTrigger>
          </TabsList>
          <TabsContent value='info'>
            <section className='rounded-2xl bg-white p-8 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              <div className='flex flex-col text-sm w-full'>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Numer oferty
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    177/10314/OMW
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Powierzchnia
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    63 m²
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>Pokoje</div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    3
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>Piętro</div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    3
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Liczba pięter
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    4
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>Winda</div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    Nie
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Data dodania
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    15.09.2025
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Komunikacja
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    Autobus, tramwaj, autostrada
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px] border-b-1 items-center border-[#00000014]'>
                  <div className='text-[--color-text-secondary]'>
                    Dostępne w okolicy
                  </div>
                  <div className='font-bold text-[--color-text-primary] text-right'>
                    Kościół, Przedszkole, Plac zabaw Zabudowa niska, Sklep,
                    Centrum Handole, Szkoła
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 px-5 py-[10px]'>
                  <div className='text-[#757575]'>Opis</div>
                </div>
              </div>
              <HtmlContent
                html={mockedOffer.description}
                className='mx-5 text-sm text-[--color-text-primary] prose prose-neutral max-w-none'
              />
            </section>
          </TabsContent>
          <TabsContent value='location'>
            <section className='rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              location
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <div className='max-w-[1200px] mx-auto mt-6'>
        <section className='rounded-2xl bg-white p-6 h-[564px] shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='flex gap-6'>
            {/* Agent card */}
            <div className='w-[300px]'>
              <div className='rounded-2xl relative w-[288px]'>
                <Image
                  src='/agents/full/jakub.jpg'
                  alt='Jakub Pruszyński'
                  width={364}
                  height={288}
                  className='w-[288px] h-[364px] rounded-2xl'
                />
                <div className='flex justify-between items-center h-[60px] absolute bottom-3 left-3 bg-white rounded-2xl p-3 w-[calc(100%-24px)]'>
                  <div className='flex flex-col'>
                    <div className='text-[--color-text-primary] font-bold text-md/5'>
                      Jakub Pruszyński
                    </div>
                    <div className='text-[#2C8E3A] font-medium text-xs/4'>
                      Specjalista ds. nieruchomości
                    </div>
                  </div>
                  <Button
                    variant='arrow'
                    size='icon'
                    className='rounded-full border-1 border-[#353535] size-8'
                  >
                    <ArrowUpRight className='size-4' />
                  </Button>
                </div>
              </div>
              <p className='mt-4 text-xs/5 text-[--color-text-secondary]'>
                Administratorem danych osobowych jest Green House Nieruchomości
                sp. z o. o. z siedzibą przy Dąbrowskiego 7 lok. 1, 42-202
                Częstochowa (“Administrator”), z którym można się skontaktować
                przez adres kontakt@ghn.pl.
              </p>
            </div>

            <div className='w-full'>
              <h2 className='text-xl/7 font-bold text-[--color-text-primary]'>
                Zapytaj o ofertę
              </h2>
              <div className='mt-6 grid grid-cols-1 gap-4'>
                <div>
                  <Label className='text-xs/5 font-bold' htmlFor='name'>
                    Imię i nazwisko
                  </Label>
                  <Input
                    id='name'
                    placeholder='Imię i nazwisko'
                    className='mt-1'
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-xs/5 font-bold' htmlFor='phone'>
                      Nr telefonu
                    </Label>
                    <Input
                      id='phone'
                      placeholder='Nr telefonu'
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label className='text-xs/5 font-bold' htmlFor='email'>
                      Adres e-mail
                    </Label>
                    <Input
                      id='email'
                      placeholder='Adres e-mail'
                      className='mt-1'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs/5 font-bold' htmlFor='message'>
                    Treść wiadomości
                  </Label>
                  <textarea
                    id='message'
                    className='mt-1 w-full min-h-[128px] rounded-md border border-input px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    rows={4}
                    placeholder='Wiadomość'
                  />
                </div>
                <div className='flex items-start gap-[10px]'>
                  <input
                    id='consent'
                    type='checkbox'
                    className='size-6 rounded border border-input'
                  />
                  <label
                    htmlFor='consent'
                    className='text-xs/5 text-[--color-text-secondary]'
                  >
                    Wyrażam zgodę na przetwarzanie moich danych osobowych przez
                    firmę Green House Nieruchomości sp. z o. o. dla celów
                    związanych z działalnością pośrednictwa w obrocie
                    nieruchomościami, jednocześnie potwierdzam, iż zostałem
                    poinformowany o tym, iż będę posiadać dostęp do treści
                    swoich danych do ich edycji lub usunięcia.
                  </label>
                </div>
                <div className='flex justify-end mt-2'>
                  <Button className='rounded-xl px-6'>Wyślij</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
