import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    
    let events;
    
    if (auth.user.role === 'ADMIN') {
      // Admin ve todos los eventos
      events = await prisma.event.findMany({
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } else {
      // Club ve solo sus eventos
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true },
      });

      if (!userClubRelation) {
        return NextResponse.json([], { status: 200 });
      }

      events = await prisma.event.findMany({
        where: {
          clubId: userClubRelation.clubId,
        },
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    }

    // Formatear para compatibilidad con el frontend
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      location: event.location,
      club: event.club.name,
      eligibleCategories: event.eligibleCategories ? JSON.parse(event.eligibleCategories) : null,
      createdAt: event.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedEvents);
  } catch (err) {
    console.error('GET /api/club/events error', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);

    const body = await request.json();
    const { title, date, location, eligibleCategories } = body || {};
    
    if (!title || !date) {
      return NextResponse.json({ error: 'title and date required' }, { status: 400 });
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
      const userClubRelation = await prisma.userClub.findFirst({
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
        date: new Date(date),
        location: location || null,
        eligibleCategories: eligibleCategories && eligibleCategories.length > 0 
          ? JSON.stringify(eligibleCategories) 
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
      date: newEvent.date.toISOString(),
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
