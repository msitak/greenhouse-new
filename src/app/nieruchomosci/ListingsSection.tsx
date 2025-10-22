import ListingRow from '@/components/listings/ListingRow';
import { prisma } from '@/services/prisma';
import { AsariStatus, Prisma } from '@prisma/client';
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
  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };

  // Filter by offer type based on selected tab (sale/rent)
  const offerTypeFilter = (() => {
    if (kind === 'rent')
      return {
        endsWith: 'Rental',
        mode: 'insensitive',
      } as Prisma.StringNullableFilter;
    if (kind === 'sale')
      return {
        endsWith: 'Sale',
        mode: 'insensitive',
      } as Prisma.StringNullableFilter;
    return undefined;
  })();

  if (offerTypeFilter) {
    filters.offerType =
      offerTypeFilter as Prisma.StringNullableFilter<'Listing'>;
  }

  // Location filters
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

  // Property type mapping via listingIdString codes (same as page and count)
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

  // Numeric ranges
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

  let orderBy: Prisma.ListingOrderByWithRelationInput[];
  switch (sort) {
    case 'price-asc':
      orderBy = [{ price: 'asc' }];
      break;
    case 'price-desc':
      orderBy = [{ price: 'desc' }];
      break;
    case 'area-asc':
      orderBy = [{ area: 'asc' }];
      break;
    case 'area-desc':
      orderBy = [{ area: 'desc' }];
      break;
    case 'newest':
    default:
      orderBy = [{ createdAtSystem: 'desc' }, { dbCreatedAt: 'desc' }];
      break;
  }

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
