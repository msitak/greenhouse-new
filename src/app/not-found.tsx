import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='relative full-bleed min-h-svh flex items-center justify-center'>
      <Image src='/404.jpg' alt='404' fill className='opacity-20' priority />

      <div className='relative z-10 w-full max-w-[1000px] px-6'>
        <div className='rounded-xl p-8 md:p-12 bg-white/0'>
          <h1 className='text-7xl font-black text-center text-primary'>404</h1>
          <p className='mt-4 text-5xl/[60px] font-medium text-center text-[--text-primary]'>
            Coś poszło nie tak
          </p>
          <p className='mt-4 text-xl text-center text-secondary'>
            Strona, której szukasz, mogła zostać przeniesiona lub usunięta.
          </p>
          <div className='mt-10 flex justify-center'>
            <Link href='/'>
              <Button className='rounded-xl px-6 py-3'>
                Wróć na stronę główną
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
