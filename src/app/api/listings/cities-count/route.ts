import { NextResponse } from 'next/server';
import { AsariStatus } from '@prisma/client';
import { prisma } from '@/services/prisma';

export async function GET() {
  try {
    // Get count of visible and active listings grouped by city
    const cityCounts = await prisma.listing.groupBy({
      by: ['locationCity'],
      where: {
        isVisible: true,
        asariStatus: {
          in: [AsariStatus.Active, AsariStatus.Closed],
        },
        locationCity: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Transform to more readable format
    const result = cityCounts.map(city => ({
      city: city.locationCity,
      count: city._count.id,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to fetch city counts:', error);
    return NextResponse.json(
      {
        message: 'Błąd serwera podczas pobierania statystyk miast.',
      },
      { status: 500 }
    );
  }
}
