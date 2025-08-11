import { Star } from 'lucide-react';

type Testimonial = { name: string; text: string; rating: number };

const testimonialsRow1: Testimonial[] = [
  { name: 'Barbara', text: 'Gorąco polecam biuro nieruchomości Green House. Profesjonalna obsługa i kompleksowe wsparcie na każdym etapie sprzedaży.', rating: 5 },
  { name: 'Dawid', text: 'Najbardziej godne polecenia biuro. Dokumenty sprawdzone, transakcja szybka i bezpieczna. Polecam!', rating: 5 },
  { name: 'Elżbieta', text: 'Kompetentny agent, pełen profesjonalizm i zaangażowanie. Rzetelna i godna zaufania obsługa.', rating: 5 },
  { name: 'Magdalena', text: 'Najlepsze biuro nieruchomości w Częstochowie. Wszystko od A do Z ogarnięte sprawnie i skutecznie.', rating: 5 },
];

const testimonialsRow2: Testimonial[] = [
  { name: 'Klaudia', text: 'Świetne biuro i rzetelne doradztwo. Widać doświadczenie i koncentrację na potrzebach klienta.', rating: 5 },
  { name: 'Nadia', text: 'Serdecznie polecam. Wszystkie formalności sprawnie i z należytą starannością.', rating: 5 },
  { name: 'Karol', text: 'Doskonała komunikacja i wsparcie. Transakcja przebiegła bezproblemowo.', rating: 5 },
  { name: 'Tomasz', text: 'Zespół działa skutecznie i konkretnie. Czułem się zaopiekowany na każdym etapie.', rating: 5 },
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
    <section aria-labelledby='testimonials-heading' className='full-bleed'>
      <div className='text-center mb-8'>
        <h2 id='testimonials-heading' className='text-4xl font-bold'>
          Oni nam zaufali, bądź następny.
        </h2>
        <p className='mt-3 text-gray-500'>
          Każda opinia ma dla nas znaczenie. Zobacz, co mówią osoby, które skorzystały z naszej platformy.
        </p>
      </div>

      <div className='marquee-viewport [--row-gap:24px] space-y-6'>
        <div className='group relative' onMouseEnter={e => (e.currentTarget.querySelector('.marquee-track') as HTMLElement)?.classList.add('is-paused')} onMouseLeave={e => (e.currentTarget.querySelector('.marquee-track') as HTMLElement)?.classList.remove('is-paused')}>
          <div className='marquee-track animate-marquee-right'>
            {[...testimonialsRow1, ...testimonialsRow1].map((t, i) => (
              <Card key={`r1-${i}`} item={t} />
            ))}
          </div>
        </div>

        <div className='group relative' onMouseEnter={e => (e.currentTarget.querySelector('.marquee-track') as HTMLElement)?.classList.add('is-paused')} onMouseLeave={e => (e.currentTarget.querySelector('.marquee-track') as HTMLElement)?.classList.remove('is-paused')}>
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


