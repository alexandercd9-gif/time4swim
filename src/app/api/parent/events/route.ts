import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCategory } from '@/lib/categories';

export async function GET(request: Request) {
  try {
    // Require parent authentication
    const auth = await requireAuth(request as any, ['PARENT', 'ADMIN']);
    
    // If admin, return all events
    if (auth.user.role === 'ADMIN') {
      const allEvents = await prisma.event.findMany({
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

      return NextResponse.json(
        allEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          location: event.location,
          club: event.club.name,
          eligibleCategories: event.eligibleCategories ? JSON.parse(event.eligibleCategories) : null,
          createdAt: event.createdAt.toISOString(),
        }))
      );
    }

    // For parents: filter events by their children's clubs and categories
    const userChildren = await prisma.userChild.findMany({
      where: { 
        userId: auth.user.id,
        isActive: true
      },
      include: {
        child: {
          include: {
            club: true
          }
        }
      }
    });

    console.log('👶 UserChildren encontrados:', userChildren.length);

    if (userChildren.length === 0) {
      console.log('⚠️ No hay hijos registrados');
      return NextResponse.json([]);
    }

    // Get unique club IDs from children
    const childrenClubIds = new Set(
      userChildren
        .map(uc => uc.child.clubId)
        .filter(Boolean) as string[]
    );

    console.log('🏊 Club IDs únicos de los hijos:', Array.from(childrenClubIds));

    if (childrenClubIds.size === 0) {
      console.log('⚠️ No hay clubes asignados a los hijos');
      return NextResponse.json([]);
    }

    // Get all events from these clubs
    const clubEvents = await prisma.event.findMany({
      where: {
        clubId: {
          in: Array.from(childrenClubIds),
        },
        date: {
          gte: new Date(), // Solo eventos futuros
        },
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

    console.log('📅 Total eventos del club:', clubEvents.length);

    // Filter events by eligible categories
    const filteredEvents = clubEvents.filter(event => {
      // Si el evento no tiene categorías elegibles, es para todos
      if (!event.eligibleCategories) {
        return true;
      }

      const eligibleCats = JSON.parse(event.eligibleCategories) as string[];
      
      // Verificar si algún hijo del padre cae en las categorías elegibles
      const eventDate = event.date;
      const competitionYear = eventDate.getFullYear();

      return userChildren.some(uc => {
        // Solo considerar hijos del mismo club que el evento
        if (uc.child.clubId !== event.clubId) {
          return false;
        }

        const childCategory = calculateCategory(uc.child.birthDate, competitionYear);
        return eligibleCats.includes(childCategory.code);
      });
    });

    console.log('✅ Eventos filtrados por categoría:', filteredEvents.length);

    return NextResponse.json(
      filteredEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        location: event.location,
        club: event.club.name,
        clubId: event.club.id,
        eligibleCategories: event.eligibleCategories ? JSON.parse(event.eligibleCategories) : null,
        createdAt: event.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error('GET /api/parent/events error', err);
    return NextResponse.json([], { status: 200 });
  }
}
