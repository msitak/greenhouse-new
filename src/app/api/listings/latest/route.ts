import { NextResponse } from 'next/server';
import { AsariStatus, Prisma } from '@/generated/client/client';

import { prisma } from '@/services/prisma';

const LATEST_LIMIT = 6;

function buildOfferTypeFilter(
  kind: string | null
): Prisma.StringNullableFilter | undefined {
  if (!kind) return undefined;

  const normalized = kind.toLowerCase();

  if (normalized === 'rent') {
    return { endsWith: 'Rental', mode: 'insensitive' };
  }

  if (normalized === 'sale') {
    return { endsWith: 'Sale', mode: 'insensitive' };
  }

  if (normalized === 'other') {
    return {
      not: {
        in: ['Rental', 'Sale'],
        mode: 'insensitive',
      },
    } as Prisma.StringNullableFilter;
  }

  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kindParam = searchParams.get('kind');

  const offerTypeFilter = buildOfferTypeFilter(kindParam);

  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: {
      in: [AsariStatus.Active, AsariStatus.Closed],
    },
  };

  if (offerTypeFilter) {
    filters.offerType = offerTypeFilter;
  }

  try {
    const listings = await prisma.listing.findMany({
      where: filters,
      orderBy: [{ createdAtSystem: 'desc' }, { dbCreatedAt: 'desc' }],
      take: LATEST_LIMIT,
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
        agentSurname: true,
        locationCity: true,
        locationStreet: true,
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

    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error('Failed to fetch latest listings:', error);
    return NextResponse.json(
      {
        message: 'Błąd serwera podczas pobierania najnowszych ofert.',
      },
      { status: 500 }
    );
  }
}
