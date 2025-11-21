import ListingRow from '@/components/listings/ListingRow';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@/generated/client';
import { ListingApiResponse } from '@/types/api.types';

const PAGE_SIZE = 10;

type SortKey = 'newest' | 'price-desc' | 'price-asc' | 'area-asc' | 'area-desc';

type Props = {
  page: number;
  sort: SortKey;
  kind: 'sale' | 'rent';
  city?: string;
  district?: string;
  street?: string;
  propertyType?: 'mieszkanie' | 'dom' | 'dzialka' | 'lokal' | 'any';
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
};

// Base filters applied to all listing queries
function buildBaseFilters(): Prisma.ListingWhereInput {
  return {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };
}

// Apply transaction kind filter mapping to Asari offer types
function applyKindFilter(
  filters: Prisma.ListingWhereInput,
  kind: 'sale' | 'rent'
) {
  const offerTypeFilter = (() => {
    if (kind === 'rent')
      return {
        endsWith: 'Rental',
        mode: 'insensitive',
      } as Prisma.StringNullableFilter<'Listing'>;
    if (kind === 'sale')
      return {
        endsWith: 'Sale',
        mode: 'insensitive',
      } as Prisma.StringNullableFilter<'Listing'>;
    return undefined;
  })();
  if (offerTypeFilter) filters.offerType = offerTypeFilter;
}

// Apply optional fuzzy location filters
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

// Translate property type to internal code filters in listingIdString
// OM = mieszkanie, OD = dom, OG = działka, OL/BL = lokal
function getPropertyTypeCodeFilters(
  propertyType?: 'mieszkanie' | 'dom' | 'dzialka' | 'lokal' | 'any'
): Prisma.ListingWhereInput[] {
  const codeFilters: Prisma.ListingWhereInput[] = [];
  if (!propertyType || propertyType === 'any') return codeFilters;

  const jsonFilter = (code: string): Prisma.ListingWhereInput => ({
    additionalDetailsJson: {
      path: ['listingIdString'],
      string_contains: code,
    } as Prisma.JsonNullableFilter<'Listing'>,
  });

  if (propertyType === 'mieszkanie') codeFilters.push(jsonFilter('OM'));
  else if (propertyType === 'dom') codeFilters.push(jsonFilter('OD'));
  else if (propertyType === 'dzialka') codeFilters.push(jsonFilter('OG'));
  else if (propertyType === 'lokal') {
    codeFilters.push(jsonFilter('OL'));
    codeFilters.push(jsonFilter('BL'));
  }
  return codeFilters;
}

function applyPropertyTypeFilters(
  filters: Prisma.ListingWhereInput,
  propertyType?: 'mieszkanie' | 'dom' | 'dzialka' | 'lokal' | 'any'
) {
  const codeFilters = getPropertyTypeCodeFilters(propertyType);
  if (codeFilters.length) filters.OR = [...(filters.OR ?? []), ...codeFilters];
}

// Apply numeric ranges if provided (ignore NaN/undefined)
function applyNumericRangeFilters(
  filters: Prisma.ListingWhereInput,
  priceMin?: number,
  priceMax?: number,
  areaMin?: number,
  areaMax?: number
) {
  if (priceMin != null && !Number.isNaN(priceMin))
    filters.price = {
      ...(filters.price as Prisma.FloatNullableFilter<'Listing'>),
      gte: priceMin,
    } as Prisma.FloatNullableFilter<'Listing'>;
  if (priceMax != null && !Number.isNaN(priceMax))
    filters.price = {
      ...(filters.price as Prisma.FloatNullableFilter<'Listing'>),
      lte: priceMax,
    } as Prisma.FloatNullableFilter<'Listing'>;
  if (areaMin != null && !Number.isNaN(areaMin))
    filters.area = {
      ...(filters.area as Prisma.FloatNullableFilter<'Listing'>),
      gte: areaMin,
    } as Prisma.FloatNullableFilter<'Listing'>;
  if (areaMax != null && !Number.isNaN(areaMax))
    filters.area = {
      ...(filters.area as Prisma.FloatNullableFilter<'Listing'>),
      lte: areaMax,
    } as Prisma.FloatNullableFilter<'Listing'>;
}

// Map UI sort key to Prisma orderBy clause
function buildOrderBy(sort: SortKey): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ price: 'asc' }];
    case 'price-desc':
      return [{ price: 'desc' }];
    case 'area-asc':
      return [{ area: 'asc' }];
    case 'area-desc':
      return [{ area: 'desc' }];
    case 'newest':
    default:
      // Prefer newest by system, then DB-created for stability
      return [{ createdAtSystem: 'desc' }, { dbCreatedAt: 'desc' }];
  }
}

export default async function ListingsSection({
  page,
  sort,
  kind,
  city,
  district,
  street,
  propertyType,
  priceMin,
  priceMax,
  areaMin,
  areaMax,
}: Props) {
  const filters: Prisma.ListingWhereInput = buildBaseFilters();
  applyKindFilter(filters, kind);
  applyLocationFilters(filters, city, district, street);
  applyPropertyTypeFilters(filters, propertyType);
  applyNumericRangeFilters(filters, priceMin, priceMax, areaMin, areaMax);

  const orderBy = buildOrderBy(sort);

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
      {listings.map(l => (
        <ListingRow
          key={l.id}
          listing={l}
          isReservation={false}
          isSpecial={false}
        />
      ))}
    </div>
  );
}
