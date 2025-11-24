import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(request);

    const { id: eventId } = await params;

    // Verificar que el usuario pertenece al club del evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const userClub = await (prisma as any).userclub.findFirst({
      where: {
        userId: auth.user.id,
        clubId: event.clubId,
        isActive: true
      }
    });

    if (!userClub) {
      return NextResponse.json(
        { error: "No tienes acceso a este club" },
        { status: 403 }
      );
    }

    // Obtener todos los carriles del evento
    const heatLanes = await prisma.heatLane.findMany({
      where: { eventId },
      include: {
        swimmer: {
          select: {
            id: true,
            name: true
          }
        },
        coach: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { heatNumber: 'asc' },
        { lane: 'asc' }
      ]
    });

    // Agrupar por número de serie
    const heatsMap = new Map<number, any>();
    
    heatLanes.forEach(heatLane => {
      const heatNum = heatLane.heatNumber || 1;
      
      if (!heatsMap.has(heatNum)) {
        heatsMap.set(heatNum, {
          id: `heat-${heatNum}`,
          number: heatNum,
          lanes: []
        });
      }
      
      heatsMap.get(heatNum)!.lanes.push({
        id: heatLane.id,
        lane: heatLane.lane,
        swimmer: heatLane.swimmer,
        coach: heatLane.coach,
        finalTime: heatLane.finalTime
      });
    });

    const heats = Array.from(heatsMap.values()).sort((a, b) => a.number - b.number);

    return NextResponse.json(heats);
  } catch (error) {
    console.error("Error fetching heats:", error);
    return NextResponse.json(
      { error: "Error al obtener las series" },
      { status: 500 }
    );
  }
}
