import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, ['PARENT']);
    
    // Get all children IDs for this parent
    const userChildren = await prisma.userChild.findMany({
      where: {
        userId: user.user.id,
        isActive: true
      },
      select: {
        childId: true
      }
    });

    const childIds = userChildren.map(uc => uc.childId);

    if (childIds.length === 0) {
      return NextResponse.json({ 
        hasLastCompetition: false,
        competitionName: null
      });
    }

    // Get the last competition name registered by this parent
    const lastCompetition = await prisma.record.findFirst({
      where: {
        childId: {
          in: childIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        competition: true,
        createdAt: true
      }
    });

    if (!lastCompetition) {
      return NextResponse.json({ 
        hasLastCompetition: false,
        competitionName: null
      });
    }

    return NextResponse.json({
      hasLastCompetition: true,
      competitionName: lastCompetition.competition
    });

  } catch (error) {
    console.error('Error fetching last competition:', error);
    return NextResponse.json(
      { error: 'Error al obtener último torneo' },
      { status: 500 }
    );
  }
}
