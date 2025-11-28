import { NextResponse } from 'next/server';
import { getLatestListings } from '@/services/cached-listings';

const LATEST_LIMIT = 6;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kindParam = searchParams.get('kind');

  let kind: 'sale' | 'rent' | 'other' | null = null;
  if (kindParam) {
    const k = kindParam.toLowerCase();
    if (k === 'sale') kind = 'sale';
    else if (k === 'rent') kind = 'rent';
    else if (k === 'other') kind = 'other';
  }

  try {
    const listings = await getLatestListings(kind, LATEST_LIMIT);
    return NextResponse.json({ data: listings });
  } catch (error) {
    console.error('Failed to fetch latest listings:', error);
    return NextResponse.json(
      {
        message: 'Błąd serwera podczas pobierania najnowszych ofert.',
      },
      { status: 500 }
    );
  }
}
