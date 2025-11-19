import { Star } from 'lucide-react';

type Testimonial = { name: string; text: string; rating: number };

const testimonialsRow1: Testimonial[] = [
  {
    name: 'Marcin',
    text: 'Po długim okresie współpracy z kilkoma agencjami w Częstochowie, już zrezygnowany... To jedyny agent, który profesjonalnie i konkretnie zajął się nieruchomością. W pierwszych dwóch tygodniach zorganizował więcej prezentacji niż inne agencje przez kilka miesięcy.',
    rating: 5,
  },
  {
    name: 'Dawid',
    text: 'Jak najbardziej biuro godne polecenia! Z ich pomocą kupiliśmy wymarzone mieszkanie i nie musieliśmy się o nic martwić. Wszystkie dokumenty sprawdzone i załatwione przez biuro, a cała transakcja przebiegła szybko i sprawnie.',
    rating: 5,
  },
  {
    name: 'Iwona',
    text: 'Jego determinacja i profesjonalizm były niezwykle imponujące, a empatia wobec moich potrzeb sprawiły, że cały proces był znacznie mniej stresujący. Polecam jego usługi wszystkim, którzy szukają nie tylko agenta, ale także partnera w tej ważnej życiowej decyzji.',
    rating: 5,
  },
  {
    name: 'Paweł',
    text: 'Mają dużą wiedzę i dobre rozeznanie rynku. Poruszanie się po szerokim rynku nieruchomości, bez wsparcia fachowego doradztwa, to ryzykowanie straty dużych pieniędzy... z nimi łatwiej mądrze myśleć o swoich pieniądzach.',
    rating: 5,
  },
  {
    name: 'Jan',
    text: 'Jako totalny laik pytałem po 10 razy o te same sprawy. Nigdy wcześniej nie kupowałem mieszkania. Pan Artur poświecił sporo czasu, by wyjaśnić zagadnienia do skutku, aż zrozumiem. Zdecydowanie polecam!',
    rating: 5,
  },
  {
    name: 'Paula',
    text: "Pani Małgosia jest agentką godną polecenia. Pomogła mi w sprzedaży mieszkania i dopięła wszystko na ostatni 'guzik'. Dzięki niej cały proces sprzedaży przebiegł na prawdę bardzo szybko i sprawnie.",
    rating: 5,
  },
];

const testimonialsRow2: Testimonial[] = [
  {
    name: 'Agnieszka',
    text: 'Na każdym etapie sprzedaży zawsze byłam o wszystkim informowana i czułam się zabezpieczona przez Annę Kuc. Pan Patryk również był bardzo uczynny. Polecam serdecznie.',
    rating: 5,
  },
  {
    name: 'Krzysztof',
    text: 'Zakup wymarzonego domu nie był łatwy z powodu zawiłości prawnych. Żmudna droga nie udała by się gdyby nie Pani Katarzyna i Pan Artur, którzy służyli ogromną wiedzą i cierpliwością. Myślę, że wielu pośredników poległoby w tej walce.',
    rating: 5,
  },
  {
    name: 'Kinga',
    text: 'W porównaniu do innych agencji nieruchomości w Green House nie ocenili nas przez pryzmat młodego wieku i pomogli zrealizować zakup od początku do końca. Pan Jakub skontaktował się z nami niemal natychmiastowo i przedstawił ofertę idealnie dobraną pod nasze potrzeby.',
    rating: 5,
  },
  {
    name: 'Danuta',
    text: 'Szczególnie do dobrej opinii z mojej strony przyczyniła się P. Anna Kuc, która sprzedała moją działkę załatwiając sprawy w Urzędach co dla mnie było nieocenione, gdyż mieszkam poza Częstochową.',
    rating: 5,
  },
  {
    name: 'Maniek',
    text: 'Polecamy Pana Artura, przeprowadził profesjonalnie kupno mieszkania i polecił kompetentne osoby do przeprowadzenia całego procesu zawarcia kredytu od A do Z. Cała procedura trwała zaledwie trzy tygodnie.',
    rating: 5,
  },
  {
    name: 'Jolanta',
    text: 'Poprzez swoją kulturę osobistą oraz sprostaniu naszym wymaganiom, zdobyli u nas zaufanie. Wszystkie sprawy związane ze sprzedażą mieszkania zostały przeprowadzone rzetelnie i bez stresu. Czuliśmy się całkowicie zaopiekowani.',
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className='flex gap-1'>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className='size-4 fill-yellow-400 text-yellow-400' />
      ))}
    </div>
  );
}

function Card({ item }: { item: Testimonial }) {
  return (
    <div className='min-w-[360px] max-w-[420px] rounded-2xl bg-white shadow-[0_8px_40px_rgba(164,167,174,0.12)] p-5'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <div className='size-8 rounded-full bg-green-primary/10 flex items-center justify-center text-green-primary font-bold'>
            {item.name.charAt(0)}
          </div>
          <span className='font-semibold'>{item.name}</span>
        </div>
        <Stars count={item.rating} />
      </div>
      <p className='text-sm text-gray-700 leading-relaxed'>{item.text}</p>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section aria-labelledby='testimonials-heading' className='md:full-bleed'>
      <div className='text-left md:text-center mb-8'>
        <h2
          id='testimonials-heading'
          className='text-[40px]/[48px] md:text-[48px] font-bold mb-4 md:mb-0'
        >
          Oni nam zaufali, bądź następny.
        </h2>
        <p className='text-gray-500 max-w-[760px] mx-auto'>
          Każda opinia ma dla nas znaczenie. To dzięki naszym klientom wiemy, że
          robimy dobrą robotę. Zobacz, co mówią osoby, które skorzystały z
          naszej platformy i przekonaj się, dlaczego warto nam zaufać.
        </p>
      </div>

      <div className='marquee-viewport pt-4 [--row-gap:24px] space-y-6 pb-6 full-bleed'>
        <div
          className='group relative'
          onMouseEnter={e =>
            (
              e.currentTarget.querySelector('.marquee-track') as HTMLElement
            )?.classList.add('is-paused')
          }
          onMouseLeave={e =>
            (
              e.currentTarget.querySelector('.marquee-track') as HTMLElement
            )?.classList.remove('is-paused')
          }
        >
          <div className='marquee-track animate-marquee-right'>
            {[...testimonialsRow1, ...testimonialsRow1].map((t, i) => (
              <Card key={`r1-${i}`} item={t} />
            ))}
          </div>
        </div>

        <div
          className='group relative'
          onMouseEnter={e =>
            (
              e.currentTarget.querySelector('.marquee-track') as HTMLElement
            )?.classList.add('is-paused')
          }
          onMouseLeave={e =>
            (
              e.currentTarget.querySelector('.marquee-track') as HTMLElement
            )?.classList.remove('is-paused')
          }
        >
          <div className='marquee-track animate-marquee-left'>
            {[...testimonialsRow2, ...testimonialsRow2].map((t, i) => (
              <Card key={`r2-${i}`} item={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
