export default function ValuationHowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Podaj adres',
      copy: 'Podaj adres nieruchomości abyśmy mogli dokładnie oszacować jej wartość',
    },
    {
      num: '2',
      title: 'Wypełnij formularz',
      copy: 'Podaj nam wszelkie niezbędne dane kontaktowe oraz przeznaczenie raportu.',
    },
    {
      num: '3',
      title: 'Otrzymaj raport',
      copy: 'Po czasie otrzymasz raport i skontaktuje się z Tobą nasz agent, aby udzielić ci wsparcia!',
    },
  ];

  return (
    <section className='px-4 md:px-8 max-w-[1200px] mx-auto py-12 md:py-20'>
      <div className='text-center'>
        <h2 className='text-[#161616] text-[28px]/[36px] md:text-[40px]/[48px] font-extrabold'>
          Jak to działa?
        </h2>
        <p className='mt-2 text-[#8E8E8E] text-[14px]/[22px] md:text-[16px]/[24px]'>
          Trzy proste kroki i za żaden nie płacisz, zobacz jak to działa.
        </p>
      </div>

      <div className='mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
        {steps.map(step => (
          <div key={step.num} className='rounded-2xl bg-[#F6F6F6] p-6 md:p-8'>
            <div className='h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-xl bg-black text-white text-xl md:text-2xl font-extrabold'>
              {step.num}
            </div>
            <h3 className='mt-6 text-[#212121] text-[22px]/[28px] md:text-[24px]/[32px] font-extrabold'>
              {step.title}
            </h3>
            <p className='mt-3 text-[#6F6F6F] text-[14px]/[22px] md:text-[16px]/[24px]'>
              {step.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
