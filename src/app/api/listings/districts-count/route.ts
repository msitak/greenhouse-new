import { NextResponse } from 'next/server';
import { AsariStatus } from '@/generated/client';
import { prisma } from '@/services/prisma';
import { formatDistrictName } from '@/lib/location/districts';

export async function GET() {
  try {
    const rows = await prisma.listing.groupBy({
      by: ['locationDistrict', 'locationCity'],
      where: {
        isVisible: true,
        asariStatus: {
          in: [AsariStatus.Active, AsariStatus.Closed],
        },
        locationDistrict: {
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

    const data = rows
      .filter(row => row.locationDistrict)
      .map(row => ({
        district: formatDistrictName(row.locationDistrict ?? ''),
        city: row.locationCity ? formatDistrictName(row.locationCity) : null,
        count: row._count.id,
      }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch district counts:', error);
    return NextResponse.json(
      {
        message: 'Błąd serwera podczas pobierania statystyk dzielnic.',
      },
      { status: 500 }
    );
  }
}
