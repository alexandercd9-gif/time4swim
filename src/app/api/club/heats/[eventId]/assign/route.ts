import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    const { eventId } = params;

    const body = await request.json();
    const { lanes } = body || {};

    if (!lanes || !Array.isArray(lanes)) {
      return NextResponse.json({ error: 'lanes array required' }, { status: 400 });
    }

    // Verificar que el evento existe y es una competencia interna
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.isInternalCompetition) {
      return NextResponse.json({ 
        error: 'Solo se pueden asignar carriles a competencias internas' 
      }, { status: 400 });
    }

    // Eliminar asignaciones existentes para este evento
    await prisma.heatLane.deleteMany({
      where: { eventId },
    });

    // Crear nuevas asignaciones
    const createPromises = lanes
      .filter((l: any) => l.swimmerId && l.coachId)
      .map((l: any) =>
        prisma.heatLane.create({
          data: {
            eventId,
            lane: l.lane,
            heatNumber: 1, // Por ahora solo una serie
            swimmerId: l.swimmerId,
            coachId: l.coachId,
          },
        })
      );

    await Promise.all(createPromises);

    return NextResponse.json({ 
      message: 'Asignaciones guardadas correctamente',
      count: createPromises.length,
    });
  } catch (err) {
    console.error('POST /api/club/heats/[eventId]/assign error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
