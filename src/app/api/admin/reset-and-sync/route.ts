import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { validateSyncToken } from '@/lib/api-auth';

export async function POST(request: Request) {
  if (!validateSyncToken(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reqUrl = new URL(request.url);
    const base = `${reqUrl.protocol}//${reqUrl.host}`;
    const authHeader = request.headers.get('Authorization') || '';

    // 1) Purge listings (images are ON DELETE CASCADE)
    const deleted = await prisma.listing.deleteMany({});

    // 2) Sync agents first (listings need agents to exist)
    console.log('[reset-and-sync] Syncing agents...');
    const agentSyncRes = await fetch(`${base}/api/admin/sync-agents`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const agentSyncJson = await agentSyncRes.json().catch(() => ({}));

    if (!agentSyncRes.ok) {
      console.error('[reset-and-sync] Agent sync failed:', agentSyncJson);
    }

    // 3) Sync listings
    console.log('[reset-and-sync] Syncing listings...');
    const syncRes = await fetch(`${base}/api/admin/sync-asari`, {
      method: 'POST',
      headers: { Authorization: authHeader },
      cache: 'no-store',
    });
    const syncJson = await syncRes.json().catch(() => ({}));

    const body = {
      message: 'Reset and sync completed',
      deletedListings: deleted.count,
      agentSync: agentSyncJson,
      listingSync: syncJson,
    };

    return NextResponse.json(body, {
      status: agentSyncRes.ok && syncRes.ok ? 200 : 500,
    });
  } catch (e) {
    console.error('reset-and-sync failed', e);
    return NextResponse.json(
      { message: 'Reset and sync failed', error: (e as Error).message },
      { status: 500 }
    );
  }
}
