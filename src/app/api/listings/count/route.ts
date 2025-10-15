import { NextResponse } from 'next/server';
import { AsariStatus, Prisma } from '@prisma/client';
import { prisma } from '@/services/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kindParam = searchParams.get('kind');
  const kind: 'sale' | 'rent' | null = kindParam === 'sale' || kindParam === 'rent' ? kindParam : null;

  const city = searchParams.get('city') || undefined;
  const district = searchParams.get('district') || undefined;
  const street = searchParams.get('street') || undefined;
  const propertyType = searchParams.get('propertyType') || undefined;

  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const areaMin = searchParams.get('areaMin');
  const areaMax = searchParams.get('areaMax');

  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };

  if (kind) {
    (filters as any).offerType = {
      endsWith: kind === 'rent' ? 'Rental' : 'Sale',
      mode: 'insensitive',
    } as Prisma.StringNullableFilter;
  }

  if (city) (filters as any).locationCity = { contains: city, mode: 'insensitive' } as Prisma.StringFilter;
  if (district) (filters as any).locationDistrict = { contains: district, mode: 'insensitive' } as Prisma.StringNullableFilter;
  if (street) (filters as any).locationStreet = { contains: street, mode: 'insensitive' } as Prisma.StringNullableFilter;

  if (propertyType && propertyType !== 'any') {
    const codeFilters: Prisma.ListingWhereInput[] = [];
    if (propertyType === 'mieszkanie') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OM' } as any });
    } else if (propertyType === 'dom') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OD' } as any });
    } else if (propertyType === 'dzialka') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OG' } as any });
    } else if (propertyType === 'lokal') {
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'OL' } as any });
      codeFilters.push({ additionalDetailsJson: { path: ['listingIdString'], string_contains: 'BL' } as any });
    }
    if (codeFilters.length) (filters as any).OR = [...((filters as any).OR ?? []), ...codeFilters];
  }

  if (priceMin !== null && priceMin !== undefined && priceMin !== '') {
    (filters as any).price = { ...(filters as any).price, gte: Number(priceMin) } as Prisma.FloatNullableFilter;
  }
  if (priceMax !== null && priceMax !== undefined && priceMax !== '') {
    (filters as any).price = { ...(filters as any).price, lte: Number(priceMax) } as Prisma.FloatNullableFilter;
  }
  if (areaMin !== null && areaMin !== undefined && areaMin !== '') {
    (filters as any).area = { ...(filters as any).area, gte: Number(areaMin) } as Prisma.FloatNullableFilter;
  }
  if (areaMax !== null && areaMax !== undefined && areaMax !== '') {
    (filters as any).area = { ...(filters as any).area, lte: Number(areaMax) } as Prisma.FloatNullableFilter;
  }

  try {
    const count = await prisma.listing.count({ where: filters });
    return NextResponse.json({ count });
  } catch (e) {
    console.error('listings/count failed', e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}


