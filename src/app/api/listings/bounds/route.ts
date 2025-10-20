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

  try {
    const aggr = await prisma.listing.aggregate({
      where: filters,
      _min: { price: true, area: true },
      _max: { price: true, area: true },
    });
    return NextResponse.json({
      minPrice: aggr._min.price ?? null,
      maxPrice: aggr._max.price ?? null,
      minArea: aggr._min.area ?? null,
      maxArea: aggr._max.area ?? null,
    });
  } catch (e) {
    console.error('listings/bounds failed', e);
    return NextResponse.json(
      { minPrice: null, maxPrice: null, minArea: null, maxArea: null },
      { status: 200 }
    );
  }
}
