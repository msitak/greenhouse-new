import Breadcrumbs from '@/components/ui/breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import AgentCard from '@/components/AgentCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { AgentInfo } from '@/types/api.types';

type AgentsListResponse = {
  success: boolean;
  count: number;
  data: AgentInfo[];
};

async function getAgents(): Promise<AgentInfo[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/agents`, {
      next: { revalidate: 300 }, // cache na 5 minut
    });

    if (!response.ok) {
      console.error('Failed to fetch agents');
      return [];
    }

    const data: AgentsListResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    return [];
  }
}

export default async function Page() {
  const agents = await getAgents();
  return (
    <div className='mt-22 mb-14'>
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
        {agents.length > 0 ? (
          agents.map(agent => (
            <div
              key={agent.asariId}
              className='rounded-2xl w-[312px] h-[388px] flex justify-center items-center bg-white shadow-[0px_2px_18.3px_0px_#0000000D]'
            >
              <Link href={`/agenci/${agent.slug}`}>
                <AgentCard
                  name={agent.fullName}
                  title='Specjalista ds. nieruchomości'
                  imageSrc={agent.imagePath}
                  imageAlt={agent.fullName}
                  className='w-[288px]'
                />
              </Link>
            </div>
          ))
        ) : (
          <p className='col-span-3 text-center text-gray-500 py-10'>
            Brak aktywnych agentów
          </p>
        )}
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
