import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ValuationFaq() {
  const faq = [
    {
      q: 'Czy wycena jest naprawdę bezpłatna i do niczego nie zobowiązuje?',
      a: 'Tak. Wycena jest darmowa i niezobowiązująca. Traktujemy ją jako pierwszy krok do rozmowy – jeśli uznasz, że możemy pomóc, wspólnie ustalimy kolejne etapy.',
    },
    {
      q: 'Jakie dane są potrzebne, aby przygotować wycenę?',
      a: 'Wystarczy dokładny adres i kilka podstawowych informacji o nieruchomości (metraż, piętro/rodzaj budynku, standard). Resztę danych zweryfikujemy po kontakcie.',
    },
    {
      q: 'Na jakiej podstawie przygotowujecie wycenę?',
      a: 'Opieramy się na realnych transakcjach i aktualnych danych rynkowych z naszego regionu, a nie na ogólnych średnich. Dzięki temu wycena jest rzetelna i dopasowana do lokalnego rynku.',
    },
    {
      q: 'Ile czasu zajmuje przygotowanie raportu?',
      a: 'Standardowo do 24–48 godzin roboczych. Jeśli sprawa wymaga dodatkowych weryfikacji, damy znać od razu po wstępnej analizie.',
    },
    {
      q: 'Czy możecie pomóc również w sprzedaży po wycenie?',
      a: 'Tak. Po wycenie możemy przygotować pełną strategię sprzedaży – marketing, prezentacje, negocjacje i formalności – ale decyzja należy wyłącznie do Ciebie.',
    },
  ];

  return (
    <section className='px-4 md:px-8 max-w-[1200px] mx-auto mt-6 md:mt-12 mb-10'>
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
                {item.q}
              </AccordionTrigger>
              <AccordionContent className='text-[#6F6F6F] text-[14px]/[22px] md:text-[16px]/[24px]'>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
