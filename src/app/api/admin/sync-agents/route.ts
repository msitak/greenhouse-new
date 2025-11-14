import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import { fetchUserList } from '@/services/asariApi';
import { generateAgentSlug, getAgentImagePath } from '@/lib/utils/agent';
import type { Prisma } from '@prisma/client';

function isAuthorized(request: Request): boolean {
  const tokenFromHeader = request.headers.get('x-admin-token');
  const tokenFromEnv = process.env.ADMIN_RESET_TOKEN;

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return !!tokenFromEnv && tokenFromHeader === tokenFromEnv;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[sync-agents] Fetching users from Asari...');
    const userListResponse = await fetchUserList();

    if (!userListResponse.success || !userListResponse.data) {
      throw new Error('Failed to fetch user list from Asari');
    }

    // Filtruj tylko aktywnych agentów
    const activeUsers = userListResponse.data.filter(
      user => user.status === 'Active'
    );

    console.log(
      `[sync-agents] Found ${activeUsers.length} active agents out of ${userListResponse.totalCount} total`
    );

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const asariUser of activeUsers) {
      try {
        const slug = generateAgentSlug(asariUser.firstName, asariUser.lastName);
        const imageFull = getAgentImagePath(
          asariUser.firstName,
          asariUser.lastName
        );
        // Dla imageRound używamy tej samej konwencji co jest w public/agents/
        const imageRound = `/agents/${asariUser.firstName}_${asariUser.lastName}.png`;

        const agentData: Prisma.AgentUpsertArgs['create'] = {
          asariId: asariUser.id,
          firstName: asariUser.firstName,
          lastName: asariUser.lastName,
          fullName: asariUser.fullName,
          slug,
          email: asariUser.email || null,
          phone: asariUser.phoneNumber || null,
          position: asariUser.position1 || null,
          bio: asariUser.description || null,
          imageAsariId: asariUser.image?.id || null,
          imageRound,
          imageFull,
          isActive: true,
          lastActivityAsari: asariUser.lastActivity
            ? new Date(asariUser.lastActivity)
            : null,
        };

        const result = await prisma.agent.upsert({
          where: { asariId: asariUser.id },
          create: agentData,
          update: {
            firstName: asariUser.firstName,
            lastName: asariUser.lastName,
            fullName: asariUser.fullName,
            slug,
            email: asariUser.email || null,
            phone: asariUser.phoneNumber || null,
            position: asariUser.position1 || null,
            bio: asariUser.description || null,
            imageAsariId: asariUser.image?.id || null,
            imageRound,
            imageFull,
            isActive: true,
            lastActivityAsari: asariUser.lastActivity
              ? new Date(asariUser.lastActivity)
              : null,
          },
        });

        // Sprawdź czy to nowy agent
        const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
        if (isNew) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(
          `[sync-agents] Error syncing agent ${asariUser.fullName} (ID: ${asariUser.id}):`,
          error
        );
        errors++;
      }
    }

    // Dezaktywuj agentów którzy nie są już aktywni w Asari
    const activeAsariIds = activeUsers.map(u => u.id);
    const deactivated = await prisma.agent.updateMany({
      where: {
        asariId: { notIn: activeAsariIds },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    console.log(
      `[sync-agents] Sync completed: ${created} created, ${updated} updated, ${deactivated.count} deactivated, ${errors} errors`
    );

    return NextResponse.json({
      success: true,
      message: 'Agents synchronized successfully',
      stats: {
        totalInAsari: userListResponse.totalCount,
        activeInAsari: activeUsers.length,
        created,
        updated,
        deactivated: deactivated.count,
        errors,
      },
    });
  } catch (error) {
    console.error('[sync-agents] Sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Agent synchronization failed',
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
