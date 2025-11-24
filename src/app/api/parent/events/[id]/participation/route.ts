import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/parent/events/:id/participation
 * Crear o actualizar participación de un hijo en un evento
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['PARENT', 'ADMIN']);
    const { id: eventId } = await context.params;
    const body = await request.json();
    const { childId, status, notes } = body || {};

    if (!childId || !status) {
      return NextResponse.json(
        { error: 'childId and status are required' },
        { status: 400 }
      );
    }

    // Validar status
    const validStatuses = ['INVITED', 'CONFIRMED', 'DECLINED', 'MAYBE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be INVITED, CONFIRMED, DECLINED, or MAYBE' },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verificar que el hijo pertenece al usuario (padre)
    const userChild = await (prisma as any).userchild.findFirst({
      where: {
        userId: auth.user.id,
        childId: childId,
        isActive: true,
      },
    });

    if (!userChild && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Child does not belong to this parent' },
        { status: 403 }
      );
    }

    // Crear o actualizar participación
    const participation = await (prisma as any).eventparticipation.upsert({
      where: {
        eventId_childId: {
          eventId,
          childId,
        },
      },
      update: {
        status,
        notes: notes || null,
        respondedAt: new Date(),
      },
      create: {
        eventId,
        childId,
        status,
        notes: notes || null,
        respondedAt: new Date(),
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log('✅ Participation saved:', participation.id, status);

    return NextResponse.json({
      id: participation.id,
      eventId: participation.eventId,
      childId: participation.childId,
      childName: participation.child.name,
      eventTitle: participation.event.title,
      status: participation.status,
      notes: participation.notes,
      respondedAt: participation.respondedAt?.toISOString(),
    });
  } catch (err) {
    console.error('POST /api/parent/events/:id/participation error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

/**
 * GET /api/parent/events/:id/participation
 * Obtener participaciones del padre para un evento específico
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['PARENT', 'ADMIN']);
    const { id: eventId } = await context.params;

    // Obtener todos los hijos del padre
    const userChildren = await (prisma as any).userchild.findMany({
      where: {
        userId: auth.user.id,
        isActive: true,
      },
      select: {
        childId: true,
      },
    });

    const childIds = userChildren.map(uc => uc.childId);

    // Obtener participaciones de todos los hijos para este evento
    const participations = await (prisma as any).eventparticipation.findMany({
      where: {
        eventId,
        childId: {
          in: childIds,
        },
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
          },
        },
      },
    });

    return NextResponse.json(
      participations.map(p => ({
        id: p.id,
        eventId: p.eventId,
        childId: p.childId,
        childName: p.child.name,
        childBirthDate: p.child.birthDate.toISOString(),
        status: p.status,
        notes: p.notes,
        respondedAt: p.respondedAt?.toISOString(),
      }))
    );
  } catch (err) {
    console.error('GET /api/parent/events/:id/participation error', err);
    return NextResponse.json([], { status: 200 });
  }
}
