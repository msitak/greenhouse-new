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

export default async function ListingsSection({ page, sort, kind, city, district, street, propertyType, priceMin, priceMax, areaMin, areaMax }: Props) {
  const filters: Prisma.ListingWhereInput = {
    isVisible: true,
    asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
  };

  // Filter by offer type based on selected tab (sale/rent)
  const offerTypeFilter = (() => {
    if (kind === 'rent') return { endsWith: 'Rental', mode: 'insensitive' } as Prisma.StringNullableFilter;
    if (kind === 'sale') return { endsWith: 'Sale', mode: 'insensitive' } as Prisma.StringNullableFilter;
    return undefined;
  })();

  if (offerTypeFilter) {
    (filters as any).offerType = offerTypeFilter;
  }

  // Location filters
  if (city) (filters as any).locationCity = { contains: city, mode: 'insensitive' } as Prisma.StringFilter;
  if (district) (filters as any).locationDistrict = { contains: district, mode: 'insensitive' } as Prisma.StringNullableFilter;
  if (street) (filters as any).locationStreet = { contains: street, mode: 'insensitive' } as Prisma.StringNullableFilter;

  // Property type mapping via listingIdString codes (same as page and count)
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

  // Numeric ranges
  if (priceMin != null && !Number.isNaN(priceMin)) (filters as any).price = { ...(filters as any).price, gte: priceMin } as Prisma.FloatNullableFilter;
  if (priceMax != null && !Number.isNaN(priceMax)) (filters as any).price = { ...(filters as any).price, lte: priceMax } as Prisma.FloatNullableFilter;
  if (areaMin != null && !Number.isNaN(areaMin)) (filters as any).area = { ...(filters as any).area, gte: areaMin } as Prisma.FloatNullableFilter;
  if (areaMax != null && !Number.isNaN(areaMax)) (filters as any).area = { ...(filters as any).area, lte: areaMax } as Prisma.FloatNullableFilter;

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


