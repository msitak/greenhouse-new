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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kind = parseKind(searchParams.get('kind'));
  const city = searchParams.get('city') || undefined;
  const district = searchParams.get('district') || undefined;
  const street = searchParams.get('street') || undefined;
  const propertyType = searchParams.get('propertyType') || undefined;

  const filters: Prisma.ListingWhereInput = buildBaseFilters();
  applyKindFilter(filters, kind);
  applyLocationFilters(filters, city, district, street);
  applyPropertyTypeFilters(filters, propertyType);

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
