import Breadcrumbs from '@/components/ui/breadcrumbs';
import Image from 'next/image';
import AgentCard from '@/components/AgentCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Agent = {
  id?: string | number;
  name: string;
  title?: string;
  imageSrc: string;
  imageAlt?: string;
};

export default function Page() {
  const agents: Agent[] = Array.from({ length: 9 }).map((_, i) => ({
    id: i + 1,
    name: 'Jakub Pruszyński',
    title: 'Specjalista ds. nieruchomości',
    imageSrc: '/agents/full/jakub.jpg',
  }));
  return (
    <div className='mt-22 mb-14 max-w-[1320px] mx-auto'>
      <Breadcrumbs className='pt-5 pb-5' />

      <h1 className='font-bold text-4xl/10 text-center'>O Nas</h1>
      <p className='max-w-[750px] mx-auto mt-6 mb-14 text-[#818181] text-md '>
        Green House to biuro nieruchomości stworzone z myślą o ludziach, którzy
        szukają więcej niż tylko mieszkania. Łączymy nasze doświadczenie z pasją
        do rynku nieruchomości, dzięki czemu pomagamy klientom podejmować
        najlepsze decyzje inwestycyjne i życiowe.
      </p>
      <Image
        src='/biuro.webp'
        alt='O Nas'
        width={13320}
        height={440}
        className='max-h-[440px] object-cover rounded-[20px]'
      />
      <h2 className='font-bold text-4xl/10 text-center mt-24'>
        Poznaj nasz zespół
      </h2>
      <p className='max-w-[750px] mx-auto mt-6 mb-11 text-[#818181] text-md '>
        Nasz zespół łączy wiedzę o rynku, pasję do nieruchomości i indywidualne
        podejście do każdego klienta. Dzięki różnorodnym kompetencjom potrafimy
        skutecznie przeprowadzić Cię przez każdy etap transakcji - poznaj nas
        bliżej!
      </p>

      <div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-[984px] mx-auto'>
        {agents.map(a => (
          <div
            key={a.id ?? a.name}
            className='rounded-2xl w-[312px] h-[388px] flex justify-center items-center bg-white shadow-[0px_2px_18.3px_0px_#0000000D]'
          >
            <AgentCard
              key={a.id ?? a.name}
              name={a.name}
              title={a.title}
              imageSrc={a.imageSrc}
              imageAlt={a.imageAlt}
              className='w-[288px]'
            />
          </div>
        ))}
      </div>
      <h2 className='font-bold text-4xl/10 text-center mt-24'>Oferty pracy</h2>
      <p className='max-w-[750px] mx-auto mt-6 mb-11 text-[#818181] text-md '>
        Nasza firma stale się rozwija - poszukujemy osób ambitnych,
        komunikatywnych i otwartych na współpracę. Jeżeli interesujesz się
        nieruchomościami, lubisz pracę z ludźmi i chcesz rozwijać się w
        dynamicznym środowisku, zapraszamy do przesłania swojej aplikacji.
      </p>

      <Accordion type='single' collapsible className='w-[1096px] mx-auto'>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='flex items-center font-bold text-[--color-text-primary] shadow-[0_5px_39.3px_0_rgba(0,0,0,0.08)] hover:no-underline cursor-pointer px-6 py-8'>
            Specjalista ds. nieruchomości
          </AccordionTrigger>
          <AccordionContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
