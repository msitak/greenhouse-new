import { AtSign, Facebook, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OfferTile from '@/components/layout/offerTile';
import type { OfferTileListing } from '@/components/layout/offerTile';
import AgentImage from '@/components/AgentImage';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { AgentPageApiResponse } from '@/types/api.types';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function resolveBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

async function getAgentData(slug: string): Promise<AgentPageApiResponse> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/api/agents/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Agent not found');
  }

  return response.json();
}

export default async function AgentPage({ params }: PageProps) {
  const { slug } = await params;

  let data: AgentPageApiResponse;
  try {
    data = await getAgentData(slug);
  } catch {
    notFound();
  }

  const { agent, listings, articles } = data;

  // Konwertuj listings do formatu OfferTileListing
  const offerTileListings: OfferTileListing[] = listings.map(listing => ({
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price,
    pricePerM2: listing.pricePerM2,
    area: listing.area,
    roomsCount: listing.roomsCount,
    floor: listing.floor,
    offerType: listing.offerType,
    agentName: `${agent.name} ${agent.surname}`,
    agentSurname: null,
    locationCity: listing.locationCity,
    locationStreet: listing.locationStreet,
    images: listing.images.map(img => ({
      urlNormal: img.urlNormal,
      urlThumbnail: img.urlThumbnail,
      description: img.description,
    })),
  }));

  return (
    <div>
      <div className='full-bleed relative h-[312px] w-full mb-[300px]'>
        <Image
          src='/test-image.jpg'
          alt='Green House'
          fill
          className='object-cover'
        />

        <div className='absolute inset-0 bg-[#000000A6]' />
        <div className='absolute inset-0 top-[168px] w-[1138px] mx-auto'>
          <div className='flex gap-10 w-full'>
            <div className='flex justify-center items-center p-3 bg-white shadow-[0_8px_40px_0_rgba(164,167,174,0.12)] rounded-2xl'>
              <div className='relative w-[288px] h-[364px] rounded-2xl overflow-hidden'>
                <AgentImage
                  imagePath={agent.imagePath || ''}
                  fullName={agent.fullName}
                  className='rounded-2xl object-cover'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2 w-full mt-6'>
              <h1 className='text-white font-bold text-5xl/11'>
                {agent.fullName}
              </h1>
              <div className='flex gap-8 text-white'>
                {agent.phone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='size-4' />
                    <span>{agent.phone}</span>
                  </div>
                )}
                {agent.email && (
                  <div className='flex items-center gap-2'>
                    <AtSign className='size-4' />
                    <span>{agent.email}</span>
                  </div>
                )}
              </div>
              <div className='mt-14'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-black font-bold text-3xl'>Poznaj mnie</h2>
                  <Facebook className='size-8' />
                </div>
                <p className='text-[#818181] text-base mt-4'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className='w-[1138px] mx-auto'>
        <h2 className='text-black font-bold mb-10 text-3xl'>
          Moje nieruchomości
        </h2>
        {offerTileListings.length > 0 ? (
          <div className='grid grid-cols-3 gap-x-4 gap-y-8'>
            {offerTileListings.map(listing => (
              <div key={listing.id} className='w-[358px]'>
                <OfferTile listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500 text-center py-10'>
            Brak aktywnych ofert
          </p>
        )}

        {articles.length > 0 && (
          <>
            <h2 className='text-black font-bold mt-14 mb-10 text-3xl'>
              Moje artykuły
            </h2>
            <div className='mr-[-151px]'>
              <Carousel opts={{ align: 'start' }}>
                <CarouselContent>
                  {articles.map(article => (
                    <CarouselItem
                      key={article._id}
                      className='basis-[370px] mb-20'
                    >
                      <Link href={`/blog/${article.slug}`}>
                        <div className='rounded-2xl bg-white shadow-[0_8px_40px_rgba(164,167,174,0.12)] overflow-hidden hover:shadow-[0_12px_48px_rgba(164,167,174,0.18)] transition-shadow'>
                          <div className='relative h-[240px]'>
                            <Image
                              src={article.coverImage?.url || '/test-image.jpg'}
                              alt={article.coverImage?.alt || article.title}
                              fill
                              className='object-cover'
                            />
                          </div>
                          <div className='p-4'>
                            <h3 className='font-bold text-lg leading-tight mb-1 line-clamp-2 min-h-[2.8rem]'>
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className='text-sm text-gray-600 leading-6 line-clamp-3 min-h-[4.5rem] mb-3'>
                                {article.excerpt}
                              </p>
                            )}
                            {article.date && (
                              <span className='text-xs text-gray-400'>
                                {new Date(article.date).toLocaleDateString(
                                  'pl-PL',
                                  {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className='hidden' />
                <CarouselNext className='hidden' />
              </Carousel>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
