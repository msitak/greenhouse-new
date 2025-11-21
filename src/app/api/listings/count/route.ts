import { NextResponse } from 'next/server';
import { AsariStatus, Prisma } from '@/generated/client';
import { prisma } from '@/services/prisma';
import { parseKind } from '@/lib/utils';

// Build the base, always-on filters to ensure only visible and valid listings are considered.
function buildBaseFilters(): Prisma.ListingWhereInput {
  return {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };
}

// Apply transaction kind filter mapping to Asari offer types.
function applyKindFilter(
  filters: Prisma.ListingWhereInput,
  kind: ReturnType<typeof parseKind>
) {
  if (!kind) return;
  filters.offerType = {
    endsWith: kind === 'rent' ? 'Rental' : 'Sale',
    mode: 'insensitive',
  } as Prisma.StringNullableFilter<'Listing'>;
}

// Apply location-based fuzzy filters when provided.
function applyLocationFilters(
  filters: Prisma.ListingWhereInput,
  city?: string,
  district?: string,
  street?: string
) {
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
}

// Translate high-level property type to internal code filters used in listingIdString.
// OM = mieszkanie, OD = dom, OG = działka, OL/BL = lokal
function getPropertyTypeCodeFilters(
  propertyType?: string | undefined
): Prisma.ListingWhereInput[] {
  const codeFilters: Prisma.ListingWhereInput[] = [];
  if (!propertyType || propertyType === 'any') return codeFilters;

  const jsonFilter = (code: string): Prisma.ListingWhereInput => ({
    additionalDetailsJson: {
      path: ['listingIdString'],
      string_contains: code,
    } as Prisma.JsonNullableFilter<'Listing'>,
  });

  if (propertyType === 'mieszkanie') {
    codeFilters.push(jsonFilter('OM'));
  } else if (propertyType === 'dom') {
    codeFilters.push(jsonFilter('OD'));
  } else if (propertyType === 'dzialka') {
    codeFilters.push(jsonFilter('OG'));
  } else if (propertyType === 'lokal') {
    codeFilters.push(jsonFilter('OL'));
    codeFilters.push(jsonFilter('BL'));
  }

  return codeFilters;
}

function applyPropertyTypeFilters(
  filters: Prisma.ListingWhereInput,
  propertyType?: string | undefined
) {
  const codeFilters = getPropertyTypeCodeFilters(propertyType);
  if (codeFilters.length) filters.OR = [...(filters.OR ?? []), ...codeFilters];
}

// Apply numeric range filters for price and area.
function applyPriceFilters(
  filters: Prisma.ListingWhereInput,
  priceMin: string | null,
  priceMax: string | null
) {
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
}

function applyAreaFilters(
  filters: Prisma.ListingWhereInput,
  areaMin: string | null,
  areaMax: string | null
) {
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kind = parseKind(searchParams.get('kind'));

  const city = searchParams.get('city') || undefined;
  const district = searchParams.get('district') || undefined;
  const street = searchParams.get('street') || undefined;
  const propertyType = searchParams.get('propertyType') || undefined;

  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const areaMin = searchParams.get('areaMin');
  const areaMax = searchParams.get('areaMax');

  const filters: Prisma.ListingWhereInput = buildBaseFilters();
  applyKindFilter(filters, kind);
  applyLocationFilters(filters, city, district, street);
  applyPropertyTypeFilters(filters, propertyType);
  applyPriceFilters(filters, priceMin, priceMax);
  applyAreaFilters(filters, areaMin, areaMax);

  try {
    const count = await prisma.listing.count({ where: filters });
    return NextResponse.json({ count });
  } catch (e) {
    console.error('listings/count failed', e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
