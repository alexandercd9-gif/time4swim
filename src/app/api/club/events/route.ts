import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    
    // Obtener parámetro de filtro para competencias internas
    const url = new URL(request.url);
    const internalOnly = url.searchParams.get('internal') === 'true';
    
    let events;
    
    if (auth.user.role === 'ADMIN') {
      // Admin ve todos los eventos
      events = await prisma.event.findMany({
        where: internalOnly ? {
          isInternalCompetition: true,
        } : undefined,
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
          participations: {
            where: {
              status: 'CONFIRMED',
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              heatLanes: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    } else {
      // Club ve solo sus eventos
      const userClubRelation = await (prisma as any).userclub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true },
      });

      if (!userClubRelation) {
        return NextResponse.json({ events: [] }, { status: 200 });
      }

      events = await prisma.event.findMany({
        where: {
          clubId: userClubRelation.clubId,
          ...(internalOnly ? { isInternalCompetition: true } : {}),
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
          participations: {
            where: {
              status: 'CONFIRMED',
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              heatLanes: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    }

    // Formatear para compatibilidad con el frontend
    const formattedEvents = events.map(event => {
      // Verificar si el evento está finalizado (descripción comienza con "COMPLETED:")
      const isCompleted = event.description?.startsWith('COMPLETED:') || false;
      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        club: event.club.name,
        eligibleCategories: event.eligibleCategories ? JSON.parse(event.eligibleCategories) : null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt ? event.updatedAt.toISOString() : null,
        confirmedParticipants: event.participations.length,
        // Datos de competencia interna
        isInternalCompetition: event.isInternalCompetition,
        isCompleted: isCompleted,
        lanes: event.lanes,
        style: event.style,
        distance: event.distance,
        categoryDistances: event.categoryDistances ? JSON.parse(event.categoryDistances) : null,
        _count: event._count,
      };
    });

    return NextResponse.json({ events: formattedEvents });
  } catch (err) {
    console.error('GET /api/club/events error', err);
    return NextResponse.json({ events: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);

    const body = await request.json();
    const { 
      title, 
      startDate, 
      endDate, 
      location, 
      eligibleCategories,
      isInternalCompetition,
      style,
      distance,
      lanes,
      categoryDistances
    } = body || {};
    
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'title, startDate and endDate required' }, { status: 400 });
    }

    // Validación para competencias internas
    if (isInternalCompetition && (!style || !distance)) {
      return NextResponse.json({ 
        error: 'Para competencias internas se requiere: style y distance' 
      }, { status: 400 });
    }

    // Obtener el club del usuario
    let clubId: string;
    
    if (auth.user.role === 'ADMIN') {
      // Admin necesita especificar el clubId o usar el primero disponible
      const firstClub = await prisma.club.findFirst();
      if (!firstClub) {
        return NextResponse.json({ error: 'No clubs available' }, { status: 400 });
      }
      clubId = firstClub.id;
    } else {
      const userClubRelation = await (prisma as any).userclub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true },
      });

      if (!userClubRelation) {
        return NextResponse.json({ error: 'User not associated with any club' }, { status: 400 });
      }

      clubId = userClubRelation.clubId;
    }

    console.log('📝 Creating event for club:', clubId);
    console.log('📝 Eligible categories:', eligibleCategories);

    const newEvent = await prisma.event.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || null,
        eligibleCategories: eligibleCategories && eligibleCategories.length > 0 
          ? JSON.stringify(eligibleCategories) 
          : null,
        isInternalCompetition: isInternalCompetition || false,
        style: style || null,
        distance: distance || null,
        lanes: lanes || null,
        categoryDistances: categoryDistances && Object.keys(categoryDistances).length > 0
          ? JSON.stringify(categoryDistances)
          : null,
        clubId,
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

    console.log('✅ Event created:', newEvent.id);

    return NextResponse.json({
      id: newEvent.id,
      title: newEvent.title,
      startDate: newEvent.startDate.toISOString(),
      endDate: newEvent.endDate.toISOString(),
      location: newEvent.location,
      club: newEvent.club.name,
      eligibleCategories: newEvent.eligibleCategories ? JSON.parse(newEvent.eligibleCategories) : null,
      createdAt: newEvent.createdAt.toISOString(),
    }, { status: 201 });
  } catch (err) {
    console.error('POST /api/club/events error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
