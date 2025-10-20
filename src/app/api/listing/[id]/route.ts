import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Asynchroniczny dostęp do params.id zgodnie z nowymi standardami Next.js
  const { id: slug } = await context.params;

  if (!slug) {
    return NextResponse.json(
      { message: 'Slug oferty jest wymagany' },
      { status: 400 }
    );
  }

  try {
    // Krok 1: Pobierz surowe dane z bazy danych używając slug
    const listingFromDb = await prisma.listing.findFirst({
      where: {
        slug: slug,
        asariStatus: 'Active', // Zabezpieczenie: serwuj tylko aktywne oferty
      },
      include: {
        images: {
          // Jawnie wybieramy pola, które chcemy zwrócić w API
          select: {
            id: true,
            asariId: true,
            urlNormal: true,
            urlThumbnail: true,
            urlOriginal: true,
            description: true,
            order: true,
            isScheme: true,
            dbCreatedAt: true,
            dbUpdatedAt: true,
          },
          orderBy: {
            order: 'asc', // Sortuj zdjęcia po ich kolejności
          },
        },
      },
    });

    if (!listingFromDb) {
      return NextResponse.json(
        { message: 'Nie znaleziono oferty' },
        { status: 404 }
      );
    }

    // Krok 2: Przetransformuj dane do formatu przyjaznego dla API (kontrakt z frontendem)
    // - Konwertuj obiekty Date na stringi w formacie ISO
    // - Enum AsariStatus jest domyślnie stringiem, więc nie wymaga konwersji
    const listingForApi = {
      ...listingFromDb,
      lastUpdatedAsari: listingFromDb.lastUpdatedAsari?.toISOString() || null,
      createdAtSystem: listingFromDb.createdAtSystem?.toISOString() || null,
      updatedAtSystem: listingFromDb.updatedAtSystem?.toISOString() || null,
      dbCreatedAt: listingFromDb.dbCreatedAt.toISOString(),
      dbUpdatedAt: listingFromDb.dbUpdatedAt.toISOString(),
      images: listingFromDb.images.map(image => ({
        ...image,
        dbCreatedAt: image.dbCreatedAt.toISOString(),
        dbUpdatedAt: image.dbUpdatedAt.toISOString(),
      })),
    };

    // Krok 3: Zwróć przetransformowane dane w odpowiedzi JSON
    return NextResponse.json(listingForApi);
  } catch (error) {
    console.error(`Błąd podczas pobierania oferty ${slug}:`, error);

    // Lepsza obsługa błędów Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Błąd walidacji, np. niepoprawny format CUID
      if (error.code === 'P2023') {
        return NextResponse.json(
          { message: 'Nieprawidłowy format ID oferty.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Wystąpił błąd serwera podczas pobierania oferty.' },
      { status: 500 }
    );
  }
}
