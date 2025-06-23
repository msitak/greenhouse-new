import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request, // Pierwszy argument
  context: { params: Promise<{ id: string }> } // Drugi argument, params jest teraz Promise
) {
  // Asynchroniczny dostęp do params.id
  const { id: listingId } = await context.params; // Używamy await na context.params

  if (!listingId) {
    // Teoretycznie, jeśli routing zadziałał, listingId powinno tu być.
    // Ale na wszelki wypadek można zostawić.
    return NextResponse.json({ message: 'ID oferty jest wymagane' }, { status: 400 });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        images: {
          select: {
            asariId: true,
            urlNormal: true,
            urlThumbnail: true,
            description: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ message: 'Nie znaleziono oferty' }, { status: 404 });
    }

    return NextResponse.json(listing);

  } catch (error: any) {
    console.error(`Błąd podczas pobierania oferty ID ${listingId}:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2023' || error.code === 'P2025') {
        return NextResponse.json({ message: 'Nieprawidłowy format ID oferty lub oferta nie istnieje' }, { status: 404 });
      }
    }
    return NextResponse.json(
      { message: 'Błąd serwera podczas pobierania oferty', error: error.message },
      { status: 500 }
    );
  }
}