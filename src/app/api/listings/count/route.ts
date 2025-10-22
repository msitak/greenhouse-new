import { NextResponse } from 'next/server';
import { AsariStatus, Prisma } from '@prisma/client';
import { prisma } from '@/services/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kindParam = searchParams.get('kind');
  const kind: 'sale' | 'rent' | null =
    kindParam === 'sale' || kindParam === 'rent' ? kindParam : null;

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
    filters.offerType = {
      endsWith: kind === 'rent' ? 'Rental' : 'Sale',
      mode: 'insensitive',
    } as Prisma.StringNullableFilter<'Listing'>;
  }

  if (city)
    filters.locationCity = {
      contains: city,
      mode: 'insensitive',
    } as Prisma.StringNullableFilter<'Listing'>;
  if (district)
    filters.locationDistrict = {
      contains: district,
      mode: 'insensitive',
    } as Prisma.StringNullableFilter<'Listing'>;
  if (street)
    filters.locationStreet = {
      contains: street,
      mode: 'insensitive',
    } as Prisma.StringNullableFilter<'Listing'>;

  if (propertyType && propertyType !== 'any') {
    const codeFilters: Prisma.ListingWhereInput[] = [];
    if (propertyType === 'mieszkanie') {
      codeFilters.push({
        additionalDetailsJson: {
          path: ['listingIdString'],
          string_contains: 'OM',
        } as Prisma.JsonNullableFilter<'Listing'>,
      });
    } else if (propertyType === 'dom') {
      codeFilters.push({
        additionalDetailsJson: {
          path: ['listingIdString'],
          string_contains: 'OD',
        } as Prisma.JsonNullableFilter<'Listing'>,
      });
    } else if (propertyType === 'dzialka') {
      codeFilters.push({
        additionalDetailsJson: {
          path: ['listingIdString'],
          string_contains: 'OG',
        } as Prisma.JsonNullableFilter<'Listing'>,
      });
    } else if (propertyType === 'lokal') {
      codeFilters.push({
        additionalDetailsJson: {
          path: ['listingIdString'],
          string_contains: 'OL',
        } as Prisma.JsonNullableFilter<'Listing'>,
      });
      codeFilters.push({
        additionalDetailsJson: {
          path: ['listingIdString'],
          string_contains: 'BL',
        } as Prisma.JsonNullableFilter<'Listing'>,
      });
    }
    if (codeFilters.length)
      filters.OR = [...(filters.OR ?? []), ...codeFilters];
  }

  if (priceMin !== null && priceMin !== undefined && priceMin !== '') {
    filters.price = {
      ...(filters.price as Prisma.FloatNullableFilter<'Listing'>),
      gte: Number(priceMin),
    } as Prisma.FloatNullableFilter<'Listing'>;
  }
  if (priceMax !== null && priceMax !== undefined && priceMax !== '') {
    filters.price = {
      ...(filters.price as Prisma.FloatNullableFilter<'Listing'>),
      lte: Number(priceMax),
    } as Prisma.FloatNullableFilter<'Listing'>;
  }
  if (areaMin !== null && areaMin !== undefined && areaMin !== '') {
    filters.area = {
      ...(filters.area as Prisma.FloatNullableFilter<'Listing'>),
      gte: Number(areaMin),
    } as Prisma.FloatNullableFilter<'Listing'>;
  }
  if (areaMax !== null && areaMax !== undefined && areaMax !== '') {
    filters.area = {
      ...(filters.area as Prisma.FloatNullableFilter<'Listing'>),
      lte: Number(areaMax),
    } as Prisma.FloatNullableFilter<'Listing'>;
  }

  try {
    const count = await prisma.listing.count({ where: filters });
    return NextResponse.json({ count });
  } catch (e) {
    console.error('listings/count failed', e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
