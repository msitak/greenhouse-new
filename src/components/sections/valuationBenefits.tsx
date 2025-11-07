import Image from 'next/image';

export default function ValuationBenefits() {
  const items = [
    {
      title:
        'Poznasz prawdziwą wartość swojego mieszkania i sprzedaż bez ryzyka.',
      copy: 'Ustalenie ceny to najważniejsza decyzja w całym procesie. Opierając się na danych transakcyjnych, a nie na domysłach, damy Ci pewność, że Twoja cena ofertowa jest optymalna – ani za niska, ani za wysoka.',
      image: '/valuation-1.png',
      alt: 'Wizualizacja budynku i symbolu ceny',
    },
    {
      title:
        'Zdobędziesz przewagę w negocjacjach. A my uzbroimy Cię w twarde dane.',
      copy: 'Przestań opierać się na emocjach. Nasz szczegółowy raport z wyceną to Twój najsilniejszy argument w rozmowach z kupującymi. Pokażemy Ci, na jakiej podstawie wyliczyliśmy wartość Twojej nieruchomości, dając Ci solidne podstawy do obrony ceny.',
      image: '/valuation-2.png',
      alt: 'Spotkanie negocjacyjne i raport z danymi',
    },
    {
      title: 'Chcesz sprzedać mieszkanie? Zaczniemy od najważniejszego!',
      copy: 'Nie trać czasu na przeglądanie setek ofert. Zacznij od tego, co najważniejsze – poznania realnej wartości Twojej nieruchomości. Nasza bezpłatna wycena to prosty, niezobowiązujący pierwszy krok, który da Ci jasny obraz sytuacji i pozwoli zaplanować dalsze działania.',
      image: '/valuation-3.png',
      alt: 'Dom jednorodzinny i symbol lupy',
    },
  ];

  return (
    <section className='px-4 md:px-8 max-w-[1200px] mx-auto py-12 md:py-20'>
      <div className='text-center'>
        <h2 className='text-[#161616] text-[28px]/[36px] md:text-[40px]/[48px] font-extrabold'>
          Co zyskujesz razem z nami?
        </h2>
        <p className='mt-2 text-[#8E8E8E] text-[14px]/[22px] md:text-[16px]/[24px]'>
          Wierzymy, że to detale robią prawdziwą robotę – sprawdź, co one
          oznaczają
        </p>
      </div>

      <div className='mt-10 md:mt-14 space-y-12 md:space-y-16'>
        {items.map((item, i) => (
          <div
            key={i}
            className='grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12'
          >
            <div className='order-2 md:order-1'>
              <h3 className='text-[#161616] text-[20px]/[28px] md:text-[24px]/[32px] font-extrabold'>
                {item.title}
              </h3>
              <p className='mt-3 text-[#6F6F6F] text-[14px]/[22px] md:text-[16px]/[24px]'>
                {item.copy}
              </p>
            </div>
            <div className='order-1 md:order-2 justify-self-center md:justify-self-end'>
              <div className='relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-2xl overflow-hidden shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className='object-cover'
                  sizes='(min-width: 768px) 420px, 320px'
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
