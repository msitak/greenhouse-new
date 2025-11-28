import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { validateSyncToken } from '@/lib/api-auth';
import { AsariStatus } from '@/generated/client/client';

/**
 * Prepares data specifically for the n8n AI Summary Worker.
 * Fetches a batch of listings that need an AI-generated summary.
 *
 * This endpoint is used by an n8n workflow to fetch a batch of listings that need an AI-generated summary.
 * It filters for listings where aiSummary is null, asariStatus is Active, and description is not null.
 */
export async function GET(request: Request) {
  // Security check
  if (!validateSyncToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        aiSummary: null,
        asariStatus: AsariStatus.Active,
        description: {
          not: null,
        },
      },
      select: {
        asariId: true,
        title: true,
        description: true,
        roomsCount: true,
        floor: true,
        locationDistrict: true,
        locationCity: true,
      },
      take: 5,
    });

    return NextResponse.json({
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching listings for AI summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
