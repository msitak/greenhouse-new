import Section from '@/components/layout/section';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, Facebook, Instagram } from 'lucide-react';

export default function Page() {
  const faq = [
    {
      question:
        'Ile kosztuje współpraca z Green House i czy są jakieś ukryte opłaty?',
      answer:
        '<p>Stawiamy na <strong>pełną transparentność</strong>. Nasze wynagrodzenie to prowizja, płatna <strong>tylko i wyłącznie po udanej finalizacji transakcji</strong>. Oznacza to, że nie ponosisz absolutnie żadnych kosztów początkowych. Pierwsze spotkanie, analiza Twojej sytuacji i przedstawienie strategii są zawsze bezpłatne i niezobowiązujące. U nas nie ma "drobnego druczku" – wszystkie warunki poznasz na samym początku.</p>',
    },
    {
      question: 'Czym różnicie się od innych agencji w Częstochowie?',
      answer:
        '<p>Wierzymy, że nasza rola to <strong>pomagać, a nie tylko sprzedawać</strong>. Wyróżniają nas trzy filary:</p><ol><li><strong>Ekspertyza oparta na danych:</strong> Każdą decyzję – od wyceny po marketing – opieramy na twardej analizie rynku i nowoczesnych narzędziach, a nie na przeczuciach.</li><li><strong>Bezpieczeństwo i proces:</strong> Bierzemy na siebie cały ciężar formalności, weryfikujemy stan prawny i przeprowadzamy Cię krok po kroku przez cały, uporządkowany proces.</li><li><strong>Partnerska relacja:</strong> Gramy z Tobą do jednej bramki. Naszym celem jest realizacja Twojego celu, a nie nasza prowizja.</li></ol>',
    },
    {
      question:
        'Czy pierwsza rozmowa lub spotkanie do czegoś mnie zobowiązuje?',
      answer:
        '<p><strong>Absolutnie do niczego.</strong> Pierwsze spotkanie, czy to u nas w biurze przy kawie, czy telefonicznie, jest dla nas okazją do poznania Twojej sytuacji i potrzeb. Chcemy zrozumieć, przed jakim wyzwaniem stoisz i czy jesteśmy w stanie Ci realnie pomóc. To partnerska rozmowa, a nie spotkanie sprzedażowe. Decyzję o ewentualnej współpracy podejmiesz na spokojnie.</p>',
    },
    {
      question: 'Na jakim terenie działacie? Czy tylko w Częstochowie?',
      answer:
        '<p>Naszym sercem i głównym obszarem ekspertyzy jest <strong>Częstochowa i okolice</strong> (powiat częstochowski, myszkowski, kłobucki). To ten rynek znamy od podszewki i tu jesteśmy najskuteczniejsi. Dzięki naszej sieci partnerów i doświadczeniu w transakcjach na odległość, z sukcesem pomagamy również klientom w innych częściach Śląska.</p>',
    },
    {
      question: 'Jak wygląda pierwszy krok po skontaktowaniu się z Wami?',
      answer:
        '<p>Po otrzymaniu Twojej wiadomości lub telefonu, umówimy krótką, <strong>niezobowiązującą konsultację</strong>. Podczas tej rozmowy skupimy się wyłącznie na wysłuchaniu Twojej historii, zrozumieniu Twoich celów i zaproponowaniu wstępnego planu działania. Dopiero potem, bez żadnej presji, zdecydujesz, co dalej.</p>',
    },
  ];
  return (
    <div className='mt-22 mb-14'>
      <Breadcrumbs className='pt-4 full-bleed max-w-[1320px] mx-auto' />
      <Section className='px-4 md:px-8 max-w-[1200px] mx-auto py-8 md:py-10'>
        <h1 className='text-[#161616] text-[36px]/[40px] md:text-[48px]/[56px] font-bold text-center md:text-left'>
          Kontakt
        </h1>

        <div className='mt-14 grid grid-cols-1 md:grid-cols-2 gap-10'>
          {/* Left column – company info */}
          <div className='space-y-10'>
            <section>
              <h2 className='text-[24px]/[32px] font-bold text-[#212121]'>
                Biuro
              </h2>
              <p className='mt-4 text-[16px]/[24px] font-medium text-[#818181]'>
                Nasze biuro jest dla Ciebie otwarte w następujących porach:
              </p>
              <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[16px]/[24px] font-medium text-black'>
                <div>poniedziałek - piątek</div>
                <div>9:00 - 17:00</div>
              </div>
              <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[16px]/[24px] font-medium text-black'>
                <div className='flex flex-col gap-1 font-medium mb-1'>
                  <div className='text-[#818181]'>Telefon</div>
                  <div className='text-black'>667 220 011</div>
                </div>
                <div className='flex flex-col gap-1 font-medium'>
                  <div className='text-[#818181]'>Email</div>
                  <div className='text-black'>bok@bngh.pl</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className='text-[24px]/[32px] font-bold text-[#212121]'>
                Dane firmy
              </h2>
              <div className='mt-3 space-y-6 font-medium'>
                <div>
                  <div className='text-[#818181] text-[16px]/[24px] mb-1'>
                    Adres
                  </div>
                  <div className='text-black text-[16px]/[24px]'>
                    Lokal 1
                    <br />
                    ul. Gen. Jana Henryka Dąbrowskiego 7
                    <br />
                    42-202 Częstochowa
                  </div>
                </div>
                <div className='mt-3 space-y-3'>
                  <div className='flex flex-col gap-1'>
                    <div className='text-[#818181] text-[16px]/[24px]'>NIP</div>
                    <div className='text-black text-[16px]/[24px]'>
                      0123131312
                    </div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='text-[#818181] text-[16px]/[24px]'>
                      REGON
                    </div>
                    <div className='text-black text-[16px]/[24px]'>
                      0123131312
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className='text-[24px]/[32px] font-bold text-[#212121]'>
                Sprawdź nasze Social Media
              </h2>
              <div className='mt-4 flex items-center gap-4'>
                <a
                  href='https://facebook.com/greenhousenieruchomosci'
                  target='_blank'
                  rel='noreferrer'
                  aria-label='Facebook'
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F1F1] text-[#1877F2]'
                >
                  <Facebook className='size-5' />
                </a>
                <a
                  href='https://instagram.com/greenhousenieruchomosci'
                  target='_blank'
                  rel='noreferrer'
                  aria-label='Instagram'
                  className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F1F1] text-[#E1306C]'
                >
                  <Instagram className='size-5' />
                </a>
              </div>
            </section>
          </div>

          {/* Right column – contact form */}
          <div>
            <div className='rounded-xl h-full bg-white p-5 md:p-8 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              <h2 className='text-[20px]/[28px] font-bold text-[#212121]'>
                Kontakt przez formularz
              </h2>

              <form className='mt-6 space-y-4'>
                <div className='grid gap-1'>
                  <Label
                    className='font-bold text-[12px]/[20px] text-black'
                    htmlFor='name'
                  >
                    Imię i nazwisko
                  </Label>
                  <Input id='name' placeholder='Imię i nazwisko' />
                </div>
                <div className='grid gap-1'>
                  <Label
                    className='font-bold text-[12px]/[20px] text-black'
                    htmlFor='phone'
                  >
                    Nr telefonu
                  </Label>
                  <Input id='phone' type='tel' placeholder='Nr telefonu' />
                </div>
                <div className='grid gap-1'>
                  <Label
                    className='font-bold text-[12px]/[20px] text-black'
                    htmlFor='email'
                  >
                    Adres e‑mail
                  </Label>
                  <Input id='email' type='email' placeholder='Adres e‑mail' />
                </div>
                <div className='grid gap-1'>
                  <Label className='font-bold text-[12px]/[20px] text-black'>
                    Co cię interesuje?
                  </Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Wybierz' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='sprzedaz'>Sprzedaż</SelectItem>
                      <SelectItem value='kupno'>Kupno</SelectItem>
                      <SelectItem value='inwestycje'>Inwestycje</SelectItem>
                      <SelectItem value='najem'>Zarządzanie najmem</SelectItem>
                      <SelectItem value='inne'>Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1'>
                  <Label
                    className='font-bold text-[12px]/[20px] text-black'
                    htmlFor='message'
                  >
                    Treść wiadomości
                  </Label>
                  <textarea
                    id='message'
                    rows={5}
                    placeholder='Wiadomość'
                    className='border-input focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs'
                  />
                </div>
                <div className='pt-2 flex items-end justify-end'>
                  <Button
                    type='button'
                    className='px-6 py-3 text-[14px]/[20px] font-medium'
                  >
                    Wyślij
                    <ChevronRight className='size-4' />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Section>
      {/* FAQ Section */}
      <Section className='px-4 md:px-8 max-w-[1200px] mx-auto mt-6 md:mt-12'>
        <h2 className='text-center text-[#161616] text-[28px]/[36px] md:text-[40px]/[48px] font-extrabold'>
          Pytania i odpowiedzi
        </h2>
        <div className='mt-8 md:mt-10'>
          <Accordion type='single' collapsible className='space-y-6'>
            {faq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i + 1}`}
                className='border-0 rounded-2xl bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] px-6 py-2'
              >
                <AccordionTrigger className='flex items-center hover:no-underline hover:cursor-pointer text-[18px]/[26px] md:text-[20px]/[24px] font-medium text-black'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='text-[#6F6F6F] text-[14px]/[22px] md:text-[16px]/[24px]'>
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </div>
  );
}
