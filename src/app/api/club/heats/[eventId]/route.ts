import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN', 'TEACHER']);
    const { eventId } = params;

    // Obtener asignaciones de carriles
    const lanes = await prisma.heatLane.findMany({
      where: {
        eventId,
      },
      include: {
        swimmer: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        lane: 'asc',
      },
    });

    return NextResponse.json({ lanes });
  } catch (err) {
    console.error('GET /api/club/heats/[eventId] error', err);
    return NextResponse.json({ lanes: [] }, { status: 200 });
  }
}
