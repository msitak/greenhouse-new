import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@/generated/client/client';
import { cacheLife, cacheTag } from 'next/cache';

export async function getLatestListings(
  kind: 'sale' | 'rent' | 'other' | null,
  limit: number
) {
  'use cache';
  cacheLife('hours'); // Built-in profile for longer caching (default is usually smaller)
  cacheTag('listings');

  let offerTypeFilter: Prisma.StringNullableFilter | undefined;

  if (kind === 'rent') {
    offerTypeFilter = { endsWith: 'Rental', mode: 'insensitive' };
  } else if (kind === 'sale') {
    offerTypeFilter = { endsWith: 'Sale', mode: 'insensitive' };
  } else if (kind === 'other') {
    offerTypeFilter = {
      not: {
        in: ['Rental', 'Sale'],
        mode: 'insensitive',
      },
    } as Prisma.StringNullableFilter;
  }

  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: {
      in: [AsariStatus.Active, AsariStatus.Closed],
    },
  };

  if (offerTypeFilter) {
    filters.offerType = offerTypeFilter;
  }

  return await prisma.listing.findMany({
    where: filters,
    orderBy: [{ createdAtSystem: 'desc' }, { dbCreatedAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      pricePerM2: true,
      area: true,
      roomsCount: true,
      floor: true,
      offerType: true,
      agentName: true,
      locationCity: true,
      locationStreet: true,
      isReservation: true,
      images: {
        select: {
          urlThumbnail: true,
          urlNormal: true,
          description: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
}
