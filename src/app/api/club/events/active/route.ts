import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener eventos que tienen fecha futura o están en curso
    const now = new Date();
    const events = await prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      include: {
        heatlane: {
          include: {
            child: {
              select: {
                id: true,
                name: true,
                lastName: true
              }
            }
          },
          orderBy: {
            heatNumber: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Transformar los datos para agrupar lanes por heat
    const eventsWithHeats = events.map((event: any) => {
      const heatMap = new Map();
      
      event.heatlane.forEach((lane: any) => {
        if (!heatMap.has(lane.heatNumber)) {
          heatMap.set(lane.heatNumber, {
            id: `${event.id}-heat-${lane.heatNumber}`,
            number: lane.heatNumber,
            lanes: []
          });
        }
        heatMap.get(lane.heatNumber).lanes.push({
          id: lane.id,
          laneNumber: lane.lane,
          swimmerId: lane.swimmerId,
          swimmer: lane.child,
          coachId: lane.coachId
        });
      });
      
      return {
        id: event.id,
        title: event.title,
        distance: event.distance || 0,
        style: event.style || '',
        eventDate: event.startDate,
        location: event.location,
        description: event.description,
        competitionType: event.isInternalCompetition ? 'internal' : 'external',
        heats: Array.from(heatMap.values())
      };
    });

    return NextResponse.json(eventsWithHeats);
  } catch (error) {
    console.error('Error fetching active events:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos activos' },
      { status: 500 }
    );
  }
}
