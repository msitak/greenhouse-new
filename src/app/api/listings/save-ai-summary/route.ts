import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { validateSyncToken } from '@/lib/api-auth';

export async function POST(request: Request) {
  // Security check
  if (!validateSyncToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, aiSummary } = body;

    // Validation
    if (!id || typeof aiSummary !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields: id and aiSummary (string)' },
        { status: 400 }
      );
    }

    // Database update
    await prisma.listing.update({
      where: { id },
      data: {
        aiSummary: aiSummary.trim(),
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AI Worker] Update failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
