import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AboutUsSection() {
  return (
    <section className='rounded-[24px]'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        <div className='relative rounded-[24px] overflow-hidden'>
          <Image src='/test-image.jpg' alt='Nasz zespół' width={800} height={520} className='w-full h-auto object-cover' />
        </div>

        <div>
          <h2 className='text-5xl font-extrabold mb-4'>Poznaj nas!</h2>
          <p className='text-gray-700 mb-4'>
            W GreenHouse Nieruchomości wierzymy, że prawdziwą siłą naszej firmy są ludzie. To właśnie oni tworzą atmosferę, która wyróżnia nas na rynku. Dobre relacje – zarówno wewnątrz zespołu, jak i z klientami – są dla nas najwyższym priorytetem.
          </p>
          <p className='text-gray-700 mb-6'>
            Nie jesteśmy tylko biurem nieruchomości. Jesteśmy grupą zaangażowanych specjalistów, którzy wspierają się nawzajem i stawiają na otwartą komunikację, zaufanie i partnerskie podejście. Dzięki temu potrafimy zbudować równie mocne relacje z naszymi klientami – oparte na szczerości, szacunku i realnym wsparciu na każdym etapie współpracy.
          </p>
          <Button>Poznaj nasz zespół</Button>
        </div>
      </div>
    </section>
  );
}


