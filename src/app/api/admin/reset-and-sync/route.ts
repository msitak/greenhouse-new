import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';

function isAuthorized(request: Request): boolean {
  const tokenFromHeader = request.headers.get('x-admin-token');
  const tokenFromEnv = process.env.ADMIN_RESET_TOKEN;

  if (process.env.NODE_ENV !== 'production') {
    // In dev, allow without token for convenience
    return true;
  }

  return !!tokenFromEnv && tokenFromHeader === tokenFromEnv;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1) Purge listings (images are ON DELETE CASCADE)
    const deleted = await prisma.listing.deleteMany({});

    // 2) Trigger a full sync using the existing endpoint
    const reqUrl = new URL(request.url);
    const base = `${reqUrl.protocol}//${reqUrl.host}`;
    const syncRes = await fetch(`${base}/api/admin/sync-asari`, {
      method: 'POST',
      // Forward the token if present
      headers: {
        'x-admin-token': request.headers.get('x-admin-token') || '',
      },
      // Ensure we always get fresh data
      cache: 'no-store',
    });

    const syncJson = await syncRes.json().catch(() => ({}));

    const body = {
      message: 'Reset and sync completed',
      deletedListings: deleted.count,
      sync: syncJson,
    };

    return NextResponse.json(body, { status: syncRes.ok ? 200 : 500 });
  } catch (e) {
    console.error('reset-and-sync failed', e);
    return NextResponse.json(
      { message: 'Reset and sync failed', error: (e as Error).message },
      { status: 500 }
    );
  }
}
