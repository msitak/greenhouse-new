import { NextResponse } from 'next/server';
import { prisma } from '@/services/prisma';
import type { AgentInfo } from '@/types/api.types';

/**
 * GET /api/agents
 * Zwraca listę wszystkich aktywnych agentów
 */
export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    const response: AgentInfo[] = agents.map(agent => ({
      asariId: agent.asariId,
      name: agent.firstName,
      surname: agent.lastName,
      fullName: agent.fullName,
      slug: agent.slug,
      phone: agent.phone,
      email: agent.email,
      imagePath: agent.imageFull,
    }));

    return NextResponse.json({
      success: true,
      count: agents.length,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
      },
      { status: 500 }
    );
  }
}
