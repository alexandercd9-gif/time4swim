import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCategory } from '@/lib/categories';

/**
 * GET /api/club/events/:id/participants
 * Obtener lista de participantes de un evento con sus respuestas
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    const { id: eventId } = await context.params;

    // Verificar que el evento existe y pertenece al club
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verificar permisos para CLUB role
    if (auth.user.role === 'CLUB') {
      const userClubRelation = await (prisma as any).userclub.findFirst({
        where: { userId: auth.user.id },
      });

      if (!userClubRelation || event.clubId !== userClubRelation.clubId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Obtener todas las participaciones del evento
    const participations = await (prisma as any).eventparticipation.findMany({
      where: {
        eventId,
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // CONFIRMED primero
        { child: { name: 'asc' } },
      ],
    });

    // Agrupar por estado
    const summary = {
      confirmed: participations.filter(p => p.status === 'CONFIRMED').length,
      declined: participations.filter(p => p.status === 'DECLINED').length,
      maybe: participations.filter(p => p.status === 'MAYBE').length,
      pending: participations.filter(p => p.status === 'INVITED').length,
    };

    const competitionYear = event.startDate.getFullYear();

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        eligibleCategories: event.eligibleCategories ? JSON.parse(event.eligibleCategories) : null,
      },
      summary,
      participants: participations.map(p => {
        const category = calculateCategory(p.child.birthDate, competitionYear);
        return {
          id: p.id,
          childId: p.child.id,
          childName: p.child.name,
          birthDate: p.child.birthDate.toISOString(),
          gender: p.child.gender,
          category: {
            code: category.code,
            name: category.name,
          },
          status: p.status,
          notes: p.notes,
          respondedAt: p.respondedAt?.toISOString(),
        };
      }),
    });
  } catch (err) {
    console.error('GET /api/club/events/:id/participants error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
