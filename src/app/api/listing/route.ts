// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma'; // Ensure this path is correct for your project
import { Prisma } from '@prisma/client';

// Define a type for allowed sortable fields for better type safety
type SortableListingFields = 'price' | 'pricePerM2' | 'createdAtSystem' | 'area' | 'roomsCount';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Paginacja
  let page = parseInt(searchParams.get('page') || '1', 10);
  let limit = parseInt(searchParams.get('limit') || '10', 10);

  // Walidacja i ustawienie domyślnych/bezpiecznych wartości
  if (isNaN(page) || page < 1) {
    page = 1; // Domyślna strona
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10; // Domyślny limit
  }

  const skip = (page - 1) * limit;
  const safeLimit = limit;

  // 2. Sortowanie
  const sortByParam = searchParams.get('sortBy') as SortableListingFields | null;
  const orderParam = searchParams.get('order')?.toLowerCase();

  // Default sort order
  let orderByClause: Prisma.ListingOrderByWithRelationInput = { createdAtSystem: 'desc' };

  if (sortByParam && ['price', 'pricePerM2', 'createdAtSystem', 'area', 'roomsCount'].includes(sortByParam)) {
    orderByClause = { [sortByParam]: (orderParam === 'asc' ? 'asc' : 'desc') };
  }

  // 3. Filtrowanie
  const filters: Prisma.ListingWhereInput = {};

  // Filtr: Miasto (locationCity)
  const city = searchParams.get('city');
  if (city) {
    filters.locationCity = { contains: city, mode: 'insensitive' };
  }

  // Filtr: Cena (price)
  const priceMin = parseFloat(searchParams.get('priceMin') || '');
  const priceMax = parseFloat(searchParams.get('priceMax') || '');
  const priceConditions: Prisma.FloatNullableFilter = {};
  if (!isNaN(priceMin)) {
    priceConditions.gte = priceMin;
  }
  if (!isNaN(priceMax)) {
    priceConditions.lte = priceMax;
  }
  if (Object.keys(priceConditions).length > 0) {
    filters.price = priceConditions;
  }

  // Filtr: Liczba pokoi (roomsCount)
  const roomsMin = parseInt(searchParams.get('roomsMin') || '', 10);
  const roomsMax = parseInt(searchParams.get('roomsMax') || '', 10);
  const roomsConditions: Prisma.IntFilter = {};
  if (!isNaN(roomsMin)) {
    roomsConditions.gte = roomsMin;
  }
  if (!isNaN(roomsMax)) {
    roomsConditions.lte = roomsMax;
  }
  if (Object.keys(roomsConditions).length > 0) {
    filters.roomsCount = roomsConditions;
  }

  // Filtr: Powierzchnia (area)
  const areaMin = parseFloat(searchParams.get('areaMin') || '');
  const areaMax = parseFloat(searchParams.get('areaMax') || '');
  const areaConditions: Prisma.FloatNullableFilter = {};
  if (!isNaN(areaMin)) {
    areaConditions.gte = areaMin;
  }
  if (!isNaN(areaMax)) {
    areaConditions.lte = areaMax;
  }
  if (Object.keys(areaConditions).length > 0) {
    filters.area = areaConditions;
  }
  
  // Filtr: Typ oferty (offerType)
  const offerType = searchParams.get('offerType');
  if (offerType) {
    // Assuming offerType in the database is stored consistently (e.g., "ApartmentSale")
    // If there can be case variations, use mode: 'insensitive'
    filters.offerType = { equals: offerType /*, mode: 'insensitive' */ };
  }

  // Opcjonalny filtr: Domyślnie pokazuj tylko "aktywne" oferty.
  // To zależy od tego, jak przechowujesz status. Przykładowo, jeśli masz pole `statusId`:
  // filters.statusId = 1; // Gdzie 1 to ID aktywnego statusu
  // Lub jeśli status jest w `additionalDetailsJson` (mniej wydajne, ale możliwe):
  // filters.additionalDetailsJson = { path: ['statusString'], equals: 'Active' };

  try {
    // 4. Wykonanie zapytań
    const listings = await prisma.listing.findMany({
      where: filters,
      orderBy: orderByClause,
      skip: skip,
      take: safeLimit,
      include: {
        images: { // Dołączamy obrazy
          select: {
            urlThumbnail: true,
            description: true,
            asariId: true, // Może być przydatne
            // Możesz też chcieć `urlNormal` jeśli miniatura ma być większa
          },
          orderBy: {
            // Jeśli masz pole `order` w modelu `ListingImage` do sortowania obrazów
            // createdAt: 'asc', // lub inne pole jak `order`
          },
          take: 1, // Tylko pierwszy obrazek jako miniatura na liście
        },
      },
    });

    const totalItems = await prisma.listing.count({
      where: filters,
    });

    // 5. Zwrócenie odpowiedzi
    return NextResponse.json({
      data: listings,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
        currentPage: page,
        pageSize: safeLimit,
      },
    });

  } catch (error: any) {
    console.error('Błąd podczas pobierania listy ofert:', error);
    // Logowanie szczegółów błędu Prisma, jeśli dostępne
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Kod błędu Prisma:', error.code);
        console.error('Meta błędu Prisma:', error.meta);
    }
    return NextResponse.json(
      { message: 'Błąd serwera podczas pobierania ofert.', error: error.message },
      { status: 500 }
    );
  } finally {
    // Rozłączanie Prisma Client nie jest zazwyczaj konieczne w długo działających aplikacjach serverless/edge,
    // ale jeśli masz specyficzne powody lub jest to część twojego wzorca:
    // await prisma.$disconnect();
  }
}