import Section from '@/components/layout/section';
import Hero from '@/components/layout/hero';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@radix-ui/react-separator';
import {
  ClipboardList,
  Files as FilesIcon,
  Gem,
  Star,
  FileWarning,
  CalendarClock,
  Gauge,
  Receipt,
  Share2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import MobileCarouselControls from '@/components/ui/MobileCarouselControls';

// ------------------------------
// Reusable UI Building Blocks
// ------------------------------

function PillsRow({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className='flex items-center justify-center gap-2 md:gap-3 flex-wrap mb-4'>
      {items.map(text => (
        <span
          key={text}
          className='px-3 py-1 rounded-full bg-[#00000004] border border-[#0000000C] text-[#212121] text-[14px]/[20px] md:text-[16px]/[22px]'
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function IntroBlock({
  pills,
  title,
  subtitle,
  buttons,
}: {
  pills: string[];
  title: string;
  subtitle: string;
  buttons: { label: string; variant?: 'default' | 'outline' | 'link' }[];
}) {
  return (
    <div className='md:max-w-[980px] mx-auto py-10 md:py-14 text-center px-4 md:px-0'>
      <PillsRow items={pills} />
      <h2 className='text-[#161616] text-[36px]/[36px] md:text-[40px]/[48px] font-extrabold'>
        {title}
      </h2>
      <p className='text-[#6F6F6F] max-w-[695px] mx-auto mt-4 text-[18px]/[28px]'>
        {subtitle}
      </p>
      <div className='mt-8 flex flex-col md:flex-row items-center justify-center gap-4'>
        {buttons.map((b, i) => (
          <Button
            key={`${b.label}-${i}`}
            variant={b.variant}
            className={`${b.variant === 'link' ? 'text-white font-medium text-[14px]/[20px]' : 'px-8 py-4 font-medium text-[14px]/[20px] w-full md:w-auto'}`}
          >
            {b.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function OffersCarousel({
  heading,
  description,
  offers,
}: {
  heading: string;
  description: string;
  offers: { src: string; title: string }[];
}) {
  return (
    <div className='ml-0 md:ml-[162px] pl-4 md:px-0 pb-16'>
      <Carousel className='w-full' opts={{ align: 'start', loop: false }}>
        <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-center'>
          <div className='md:col-span-4 w-[420px]'>
            <h3 className='text-[28px]/[36px] md:text-[40px]/[48px] font-bold text-[#161616] text-center md:text-left pr-4 md:mr-0'>
              {heading}
            </h3>
            <p className='text-[#6F6F6F] mt-6 max-w-[423px] text-center md:text-left pr-4 md:mr-0'>
              {description}
            </p>
            <div className='mt-12 hidden md:flex gap-3'>
              <CarouselPrevious className='static size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]' />
              <CarouselNext className='static size-10 rounded-full text-[--color-text-primary] bg-[#F6F6F6] border-none hover:bg-[#E6E6E6]' />
            </div>
          </div>
          <div className='md:col-span-8'>
            <CarouselContent>
              {offers.map((item, idx) => (
                <CarouselItem
                  key={`${item.src}-${idx}`}
                  className='basis-[35%%] last:pr-3'
                >
                  <div className='relative h-[325px] w-[264px] rounded-2xl'>
                    <Image
                      src={item.src}
                      alt=''
                      fill
                      sizes='(min-width:1280px) 380px, 50vw'
                      className='object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t rounded-2xl from-black/70 via-black/20 to-transparent' />
                    <div className='absolute left-4 right-4 bottom-3 text-white text-[16px]/[22px] font-semibold whitespace-pre-line'>
                      {item.title}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </div>
        {/* Mobile controls below slider with active dots */}
        <MobileCarouselControls />
      </Carousel>
    </div>
  );
}

function ProcessSection({
  id,
  steps,
}: {
  id: string;
  steps: { no: string; title: string; desc: string }[];
}) {
  return (
    <Section id={id} className='md:mx-auto my-10'>
      <div className='bg-[#00000004] py-21 px-4 md:px-16'>
        <h3 className='text-center text-[28px]/[36px] md:text-[40px]/[48px] font-bold text-[#212121]'>
          Poznaj nasz proces
        </h3>
        <p className='text-center text-[#818181] mt-2'>
          Przejrzysty proces od analizy po finalizację – krok po kroku do
          bezpiecznej transakcji
        </p>
        <div className='mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 w-full md:w-[1096px] mx-auto px-4 md:px-0'>
          {steps.map(step => (
            <div
              key={step.no}
              className='bg-[#00000004] rounded-2xl w-full md:w-[200px] h-[200px] md:h-[420px] px-6 md:px-0 py-8 md:py-10 grid md:block grid-cols-[96px_1px_1fr] items-center gap-6'
            >
              <div className='text-[72px]/[72px] md:text-[100px]/[112px] font-extrabold text-[#0000000F] justify-self-center self-center'>
                {step.no}
              </div>
              {/* Mobile vertical separator (inset, centered) */}
              <div className='md:hidden w-px h-[136px] bg-[#00000014] justify-self-center self-center' />
              <div className='self-center'>
                <Separator className='mt-13 bg-[#0000000F] h-[1px] mx-5 hidden md:block' />
                <div className='mt-0 md:mt-14 font-semibold text-[20px] md:text-[24px] text-[#161616] md:text-center'>
                  {step.title}
                </div>
                <div className='mt-1 md:mt-2 text-[14px] md:text-[16px] text-[#9D9D9D] md:text-center'>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function BenefitsSection({
  id,
  items,
}: {
  id: string;
  items: { icon: ReactNode; label: string }[];
}) {
  return (
    <Section id={id} className='my-16 md:max-w-[900px] md:mx-auto'>
      <h3 className='text-center text-[28px]/[36px] md:text-[36px]/[44px] font-extrabold text-[#161616]'>
        Co od nas otrzymasz?
      </h3>
      <p className='text-center text-[#9D9D9D] mt-2'>
        Pełne wsparcie na każdym etapie ale nie tylko...
      </p>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 place-items-center'>
        {items.map((it, idx) => (
          <div
            key={`${it.label}-${idx}`}
            className='flex flex-col items-center text-center'
          >
            <div className='w-[80px] h-[80px] rounded-full bg-[#F1F1F1] flex items-center justify-center'>
              {it.icon}
            </div>
            <div className='mt-3 text-[16px] font-medium text-[#1A1A1A]'>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DarkCta({
  id,
  primary,
  secondary,
  href,
}: {
  id: string;
  primary: string;
  secondary: string;
  href?: string;
}) {
  return (
    <Section id={id} className='mt-12'>
      <div className='bg-[#1E1E1E] text-white py-16 px-4'>
        <div className='text-center md:max-w-[980px] mx-auto'>
          <h3 className='text-[32px]/[40px] md:text-[40px]/[48px] font-bold'>
            Podejmij działanie już dziś
          </h3>
          <p className='mt-1 text-[#A8A8A8] text-[16px]/[24px]'>
            Przejrzysty proces od analizy po finalizację - krok po kroku do
            bezpiecznej transakcji
          </p>
          <div className='mt-10 flex flex-col items-center gap-3'>
            {href ? (
              <Button asChild className='mb-4'>
                <Link href={href}>{primary}</Link>
              </Button>
            ) : (
              <Button className='mb-4'>{primary}</Button>
            )}
            <Button
              variant='link'
              className='text-white font-medium text-[14px]/[20px]'
            >
              {secondary}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ImageCta({
  id,
  imageSrc,
  headline,
  linkHref,
  linkText,
}: {
  id: string;
  imageSrc: string;
  headline: string;
  linkHref: string;
  linkText: string;
}) {
  return (
    <Section id={id} className='mt-12'>
      <div className='relative overflow-hidden rounded-none'>
        <Image
          src={imageSrc}
          alt=''
          width={1920}
          height={600}
          className='w-full h-[320px] md:h-[380px]'
        />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h3 className='text-[24px]/[32px] md:text-[32px]/[40px] font-extrabold'>
              {headline}
            </h3>
            <p className='mt-1 text-white/80'>
              Odwiedź{' '}
              <a
                className='underline text-[#fb8500] !underline'
                href={linkHref}
                target='_blank'
                rel='noreferrer'
              >
                {linkText}
              </a>{' '}
              i zapoznaj się z pełną ofertą
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function Page() {
  return (
    <div>
      <Section id='hero'>
        <Hero
          src='/services-hero.png'
          alt='Poznaj nasze usługi'
          overlay
          quality={100}
          fit='cover'
          objectPosition='50% 15%'
          sizes='100vw'
          // Desktop: 525px height, edge-to-edge (no padding/rounding)
          className='md:px-0 md:pt-0 md:pb-0'
          innerClassName='h-[312px] md:h-[525px] md:rounded-none md:overflow-visible'
        >
          <div className='absolute inset-x-0 top-[100px] md:top-[180px] z-10 flex items-center justify-center px-[16px] md:px-[60px]'>
            <div className='text-center font-[family-name:var(--font-montserrat)]'>
              <h1 className='text-white text-[40px]/[48px] md:text-6xl font-semibold'>
                Poznaj nasze usługi
              </h1>
              <p className='text-white text-[16px]/[24px] max-w-[860px] mx-auto md:text-xl mt-3'>
                Sprzedaż, kupno, inwestycje i zarządzanie najmem na terenie
                Częstochowy i woj. śląskiego.
              </p>
            </div>
          </div>
        </Hero>
      </Section>

      {/* Top tabs (desktop-first) */}
      <Section id='service-tabs' className='full-bleed'>
        <Tabs defaultValue='brokerage' className='w-full bg-none'>
          <div className='relative w-full overflow-x-auto md:overflow-visible bg-none'>
            <TabsList className='bg-none mx-auto inline-flex md:block'>
              <TabsTrigger
                className='relative z-10 bg-transparent rounded-none border-b border-transparent data-[state=active]:border-[#4FA200] data-[state=active]:bg-white font-normal data-[state=active]:font-medium'
                value='brokerage'
              >
                <span className='grid'>
                  <span className='col-start-1 row-start-1'>
                    Sprzedaż nieruchomości
                  </span>
                  <span
                    aria-hidden
                    className='col-start-1 row-start-1 invisible font-medium'
                  >
                    Sprzedaż nieruchomości
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                className='relative z-10 bg-transparent rounded-none border-b border-transparent data-[state=active]:border-[#4FA200] data-[state=active]:bg-white font-normal data-[state=active]:font-medium'
                value='purchase'
              >
                <span className='grid'>
                  <span className='col-start-1 row-start-1'>
                    Kupno nieruchomości
                  </span>
                  <span
                    aria-hidden
                    className='col-start-1 row-start-1 invisible font-medium'
                  >
                    Kupno nieruchomości
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                className='relative z-10 bg-transparent rounded-none border-b border-transparent data-[state=active]:border-[#4FA200] data-[state=active]:bg-white font-normal data-[state=active]:font-medium'
                value='invest'
              >
                <span className='grid'>
                  <span className='col-start-1 row-start-1'>Inwestycje</span>
                  <span
                    aria-hidden
                    className='col-start-1 row-start-1 invisible font-medium'
                  >
                    Inwestycje
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                className='relative z-10 bg-transparent rounded-none border-b border-transparent data-[state=active]:border-[#4FA200] data-[state=active]:bg-white font-normal data-[state=active]:font-medium'
                value='renting'
              >
                <span className='grid'>
                  <span className='col-start-1 row-start-1'>
                    Zarządzanie najmem
                  </span>
                  <span
                    aria-hidden
                    className='col-start-1 row-start-1 invisible font-medium'
                  >
                    Zarządzanie najmem
                  </span>
                </span>
              </TabsTrigger>
            </TabsList>
            <div className='pointer-events-none absolute left-0 right-0 bottom-0 h-px bg-[#00000010]' />
          </div>

          {/* Sprzedaż nieruchomości – desktop focus */}
          <TabsContent value='brokerage'>
            <IntroBlock
              pills={['Wycena 24 h', 'Prowizja 3-4%', 'Raport co 14 dni']}
              title='Pośrednictwo sprzedaży i najmu'
              subtitle='Pośrednictwo w sprzedaży i wynajmie mieszkań, domów, działek i lokali usługowych – skutecznie i bezpiecznie.'
              buttons={[
                { label: 'Skontaktuj się z nami' },
                { label: 'Przygotuj wycenę AI', variant: 'outline' },
              ]}
            />

            {/* Co oferujemy? */}
            <OffersCarousel
              heading='Co oferujemy?'
              description='W ramach pośrednictwa zapewniamy pełną obsługę sprzedaży i wynajmu – od szybkiej wyceny i opracowania strategii, przez przygotowanie profesjonalnych materiałów.'
              offers={[
                { src: '/brokerage-1.png', title: 'Wycena &\nstrategia w 24h' },
                { src: '/brokerage-2.png', title: 'Przygotowanie\nmaterialów' },
                {
                  src: '/brokerage-3.png',
                  title: 'Przygotowanie opisu\n oraz karty atutów',
                },
                {
                  src: '/brokerage-4.png',
                  title: 'Publikacja i\nobsługa leadów',
                },
                {
                  src: '/brokerage-5.png',
                  title: 'Negocjacje oraz\ndue diligence',
                },
                {
                  src: '/brokerage-6.png',
                  title: 'Koordynacja aktu\noraz przekazania',
                },
              ]}
            />

            {/* Poznaj nasz proces */}
            <ProcessSection
              id='process'
              steps={[
                {
                  no: '1',
                  title: 'Audyt',
                  desc: 'analiza cen za metr kwadratowy i popytu',
                },
                {
                  no: '2',
                  title: 'Tworzenie',
                  desc: 'dodanie materiałów i szczegółów oferty',
                },
                {
                  no: '3',
                  title: 'Publikacja',
                  desc: 'publikacja oferty na portalach',
                },
                { no: '4', title: 'Negocjacje', desc: 'negocjacje warunków' },
                {
                  no: '5',
                  title: 'Finalizacja',
                  desc: 'finalizacja u notariusza i przekazanie kluczy',
                },
              ]}
            />

            {/* Co od nas otrzymasz? */}
            <Section
              id='benefits'
              className='my-16 mb-24 md:max-w-[850px] md:mx-auto'
            >
              <h3 className='text-center text-[28px]/[36px] md:text-[40px]/[48px] font-bold text-[#212121]'>
                Co od nas otrzymasz?
              </h3>
              <p className='text-center text-[#818181]'>
                Pełne wsparcie na każdym etapie ale nie tylko...
              </p>
              <div className='mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 place-items-center'>
                {[
                  {
                    icon: <ClipboardList className='size-8 text-black' />,
                    label: 'Raport działań (KPI)',
                  },
                  {
                    icon: <FilesIcon className='size-8 text-black' />,
                    label: 'Komplet dokumentów',
                  },
                  {
                    icon: <Gem className='size-8 text-black' />,
                    label: 'Protokół przekazania',
                  },
                ].map((it, idx) => (
                  <div
                    key={idx}
                    className='flex flex-col items-center text-center'
                  >
                    <div className='w-[80px] h-[80px] rounded-full bg-[#F1F1F1] flex items-center justify-center'>
                      {it.icon}
                    </div>
                    <div className='mt-4 text-[20px] font-semibold text-[#212121]'>
                      {it.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* CTA section */}
            <DarkCta
              id='cta'
              href='/kontakt'
              primary='Skontaktuj się z nami'
              secondary='Wycena AI'
            />
          </TabsContent>

          {/* Inwestycje */}
          <TabsContent value='invest'>
            <IntroBlock
              pills={['ROI/Cap rate', 'Raport due diligence']}
              title='Inwestycje'
              subtitle='Dostarczamy sprawdzone inwestycje z policzoną rentownością i pełnym nadzorem aż do wynajmu lub sprzedaży.'
              buttons={[
                { label: 'Policz ROI (AI)' },
                { label: 'Umów konsultację', variant: 'outline' },
              ]}
            />

            {/* Co oferujemy? */}
            <OffersCarousel
              heading='Co oferujemy?'
              description='Dajemy Ci dostęp do sprawdzonych inwestycji z pełną analizą ROI i due diligence. Od zakupu, przez wykończenie i exit – dbamy o Twój zysk i bezpieczeństwo.'
              offers={[
                { src: '/invest-1.png', title: 'Sourcing okazji' },
                { src: '/invest-2.png', title: 'Analiza ROI (AI)' },
                { src: '/invest-3.png', title: 'Budżet oraz\nharmonogram' },
                { src: '/invest-4.png', title: 'Nadzór remontu' },
                { src: '/invest-5.png', title: 'Najem lub sprzedaż' },
                { src: '/invest-6.png', title: 'Rozliczenie projektu' },
              ]}
            />

            {/* Proces inwestycyjny */}
            <ProcessSection
              id='process-invest'
              steps={[
                {
                  no: '1',
                  title: 'Sourcing',
                  desc: 'Określimy rodzaj inwestycji',
                },
                {
                  no: '2',
                  title: 'ROI/DD',
                  desc: 'Liczby, ryzyka lub scenariusze? Zostaw to nam!',
                },
                {
                  no: '3',
                  title: 'Zakup',
                  desc: 'Wynegocjujemy najlepszą cenę i zadbamy o dokumenty',
                },
                {
                  no: '4',
                  title: 'Nadzór',
                  desc: 'Dopilnujemy remontu oraz przygotowania inwestycji',
                },
                {
                  no: '5',
                  title: 'Exit/Najem',
                  desc: 'Wyposażymy Cię w wynajmie lub sprzedaży',
                },
              ]}
            />

            {/* Co od nas otrzymasz? – inwestycje */}
            <BenefitsSection
              id='benefits-invest'
              items={[
                {
                  icon: <Gauge className='size-8 text-black' />,
                  label: 'Model ROI (AI‑valuation)',
                },
                {
                  icon: <Receipt className='size-8 text-black' />,
                  label: 'Raport due diligence & ustalenie budżetu',
                },
                {
                  icon: <Share2 className='size-8 text-black' />,
                  label: 'Plan wyjścia lub najmu',
                },
              ]}
            />

            {/* CTA – inwestycje */}
            <DarkCta
              id='cta-invest'
              primary='Skontaktuj się z nami'
              secondary='Wycena AI'
            />
          </TabsContent>
          {/* Kupno nieruchomości */}
          <TabsContent value='purchase'>
            <IntroBlock
              pills={['Shortlista 7–14 dni', 'Dostęp off‑market']}
              title='Kupno nieruchomości'
              subtitle='Twoje interesy są naszym priorytetem – reprezentujemy Cię przy kupnie nieruchomości.'
              buttons={[{ label: 'Porozmawiajmy o kryteriach' }]}
            />

            {/* Co oferujemy? */}
            <OffersCarousel
              heading='Co oferujemy?'
              description='Przygotowujemy shortlistę ofert w 7–14 dni, zapewniamy dostęp do off‑market i negocjujemy najlepsze warunki zakupu.'
              offers={[
                { src: '/purchase-1.png', title: 'Brief i kryteria' },
                { src: '/purchase-2.png', title: 'Sourcing:\nportale & sieć' },
                { src: '/purchase-3.png', title: 'Shortlista:\n5–10 pozycji' },
                {
                  src: '/purchase-4.png',
                  title: 'Oględziny oraz\nweryfikacje',
                },
                {
                  src: '/purchase-5.png',
                  title: 'Negocjacje oraz\nrezerwacja',
                },
                { src: '/purchase-6.png', title: 'Koordynacja aktu' },
              ]}
            />

            {/* Poznaj nasz proces – wariant zakupowy */}
            <ProcessSection
              id='process-buy'
              steps={[
                {
                  no: '1',
                  title: 'Brief',
                  desc: 'Zbieramy wszystkie potrzebne informacje',
                },
                {
                  no: '2',
                  title: 'Sourcing',
                  desc: 'Przeglądamy przez wszystkie oferty',
                },
                {
                  no: '3',
                  title: 'Shortlista',
                  desc: 'Wybieramy 5–10 najlepszych opcji zgodnych z kryteriami',
                },
                {
                  no: '4',
                  title: 'Oględziny',
                  desc: 'Sprawdzimy KW, sytuację finansową oraz sąsiedztwo',
                },
                {
                  no: '5',
                  title: 'Zakup',
                  desc: 'Negocjacje, zadatki, akt? Zostaw to nam!',
                },
              ]}
            />

            {/* Co od nas otrzymasz? – wariant zakupowy */}
            <BenefitsSection
              id='benefits-buy'
              items={[
                {
                  icon: <Star className='size-8 text-black' />,
                  label: 'Shortlista + scoring',
                },
                {
                  icon: <FileWarning className='size-8 text-black' />,
                  label: 'Raport ryzyka',
                },
                {
                  icon: <CalendarClock className='size-8 text-black' />,
                  label: 'Harmonogram zakupu',
                },
              ]}
            />

            {/* CTA section – purchase */}
            <DarkCta
              id='cta-buy'
              primary='Skontaktuj się z nami'
              secondary='Wycena AI'
            />
          </TabsContent>

          {/* Zarządzanie najmem */}
          <TabsContent value='renting'>
            <IntroBlock
              pills={['SLA 12/24', 'Rozliczenia DDO+1']}
              title='Zarządzanie najmem'
              subtitle='Kompleksowe zarządzanie najmem – od selekcji najemców po rozliczenia oraz obsługę zgłoszeń.'
              buttons={[
                { label: 'Porównaj pakiety' },
                { label: 'Jak to działa?', variant: 'outline' },
              ]}
            />

            {/* Co oferujemy? */}
            <OffersCarousel
              heading='Co oferujemy?'
              description='Zajmujemy się całym procesem najmu – od selekcji najemców po rozliczenia i raporty. Z nami masz stabilny dochód bez formalności.'
              offers={[
                { src: '/rent-1.png', title: 'Publikacja i selekcja' },
                { src: '/rent-2.png', title: 'Umowy oraz\nprotokoły' },
                { src: '/rent-3.png', title: 'Pobór czynszu' },
                { src: '/rent-4.png', title: 'Obsługa zgłoszeń' },
                { src: '/rent-5.png', title: 'Aneksy oraz\nindeksacja' },
                { src: '/rent-6.png', title: 'Raporty i wizyty' },
              ]}
            />

            {/* Proces zarządzania najmem */}
            <ProcessSection
              id='process-rent'
              steps={[
                {
                  no: '1',
                  title: 'Przyjęcie',
                  desc: 'Czyli inwentaryzacja i rozeznanie',
                },
                {
                  no: '2',
                  title: 'Najemca',
                  desc: 'Przeprowadzimy selekcję i ogarniemy kwestię umowy',
                },
                {
                  no: '3',
                  title: 'Obsługa',
                  desc: 'Zgłoszenia i serwis? Bierzemy to na nas!',
                },
                {
                  no: '4',
                  title: 'Rozliczenia',
                  desc: 'Rozliczymy czynsz, opłaty oraz ogarniemy kwestię kaucji',
                },
                {
                  no: '5',
                  title: 'Raporty',
                  desc: 'Przygotujemy Ci specjalny raport z KPI',
                },
              ]}
            />

            {/* Co od nas otrzymasz? – najem */}
            <BenefitsSection
              id='benefits-rent'
              items={[
                {
                  icon: <FilesIcon className='size-8 text-black' />,
                  label: 'Umowa i protokół',
                },
                {
                  icon: <ClipboardList className='size-8 text-black' />,
                  label: 'Miesięczne rozliczenie',
                },
                {
                  icon: <Receipt className='size-8 text-black' />,
                  label: 'Raport serwisowy',
                },
              ]}
            />

            {/* CTA – Najmownik promo */}
            <ImageCta
              id='cta-rent'
              imageSrc='/najmownik.png'
              headline='Potrzebujesz większego wsparcia w najmie?'
              linkHref='https://najmownik.pl'
              linkText='najmownik.pl'
            />
          </TabsContent>
        </Tabs>
      </Section>
    </div>
  );
}
