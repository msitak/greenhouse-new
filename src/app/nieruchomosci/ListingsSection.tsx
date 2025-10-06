import ListingRow from '@/components/listings/ListingRow';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@prisma/client';
import { ListingApiResponse } from '@/types/api.types';

const PAGE_SIZE = 10;

type SortKey = 'newest' | 'price-desc' | 'price-asc' | 'area-asc' | 'area-desc';

type Props = {
  page: number;
  sort: SortKey;
};

export default async function ListingsSection({ page, sort }: Props) {
  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };

  const orderBy = (() => {
    switch (sort) {
      case 'price-asc':
        return [{ price: 'asc' }] as const;
      case 'price-desc':
        return [{ price: 'desc' }] as const;
      case 'area-asc':
        return [{ area: 'asc' }] as const;
      case 'area-desc':
        return [{ area: 'desc' }] as const;
      case 'newest':
      default:
        return [{ createdAtSystem: 'desc' }, { dbCreatedAt: 'desc' }] as const;
    }
  })();

  const listings = (await prisma.listing.findMany({
    where: filters,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      pricePerM2: true,
      offerType: true,
      area: true,
      roomsCount: true,
      floor: true,
      createdAtSystem: true,
      agentName: true,
      agentSurname: true,
      floorCount: true,
      additionalDetailsJson: true,
      privateDescription: true,
      images: {
        select: {
          urlThumbnail: true,
          urlNormal: true,
          description: true,
          order: true,
          isScheme: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })) as unknown as ListingApiResponse[];

  return (
    <div className='space-y-6'>
      {listings.map((l) => (
        <ListingRow key={l.id} listing={l} isReservation={false} isSpecial={false} />
      ))}
    </div>
  );
}


