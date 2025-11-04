import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT: Actualizar un evento
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    const { id } = await context.params;
    const body = await request.json();
    const { title, date, location, eligibleCategories } = body || {};

    if (!title || !date) {
      return NextResponse.json({ error: 'title and date required' }, { status: 400 });
    }

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { club: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verificar permisos
    if (auth.user.role === 'CLUB') {
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
      });

      if (!userClubRelation || existingEvent.clubId !== userClubRelation.clubId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Actualizar el evento
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        location: location || null,
        eligibleCategories: eligibleCategories && eligibleCategories.length > 0
          ? JSON.stringify(eligibleCategories)
          : null,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('✅ Event updated:', updatedEvent.id);

    return NextResponse.json({
      id: updatedEvent.id,
      title: updatedEvent.title,
      date: updatedEvent.date.toISOString(),
      location: updatedEvent.location,
      club: updatedEvent.club.name,
      eligibleCategories: updatedEvent.eligibleCategories ? JSON.parse(updatedEvent.eligibleCategories) : null,
      updatedAt: updatedEvent.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error('PUT /api/club/events/[id] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// DELETE: Eliminar un evento
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ DELETE /api/club/events/[id] - Starting...');
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    console.log('✅ Auth successful, user:', auth.user.id, 'role:', auth.user.role);
    
    const { id } = await context.params;
    console.log('📝 Event ID to delete:', id);

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      console.log('❌ Event not found');
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verificar permisos
    if (auth.user.role === 'CLUB') {
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
      });

      if (!userClubRelation || existingEvent.clubId !== userClubRelation.clubId) {
        console.log('❌ Unauthorized - club mismatch');
        return NextResponse.json({ error: 'Unauthorized - Este evento pertenece a otro club' }, { status: 403 });
      }
    }

    // Eliminar el evento (también eliminará las participaciones por CASCADE)
    await prisma.event.delete({
      where: { id },
    });

    console.log('✅ Event deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE /api/club/events/[id] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
