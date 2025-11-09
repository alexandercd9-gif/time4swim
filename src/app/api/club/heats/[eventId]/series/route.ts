import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener series existentes
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await requireAuth(req as any, ['CLUB', 'ADMIN', 'TEACHER']);

    const { eventId } = params;

    // Obtener todas las series del evento
    const heatLanes = await prisma.heatLane.findMany({
      where: { 
        eventId: eventId,
        swimmerId: { not: null }, // Solo donde hay nadadores asignados
      },
      include: {
        swimmer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { heatNumber: "asc" },
        { lane: "asc" },
      ],
    });

    // Agrupar por número de serie
    const seriesMap = new Map();
    heatLanes.forEach((hl) => {
      if (!seriesMap.has(hl.heatNumber)) {
        seriesMap.set(hl.heatNumber, {
          number: hl.heatNumber,
          swimmers: [],
        });
      }
      
      seriesMap.get(hl.heatNumber).swimmers.push({
        lane: hl.lane,
        swimmerId: hl.swimmerId,
        swimmerName: hl.swimmer?.name || "Sin nombre",
      });
    });

    const series = Array.from(seriesMap.values());

    return NextResponse.json({ series });
  } catch (error) {
    console.error("Error obteniendo series:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva serie
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const auth = await requireAuth(req as any, ['CLUB', 'ADMIN']);

    // Obtener club del usuario
    const userClubRelation = await prisma.userClub.findFirst({
      where: { userId: auth.user.id },
    });

    if (!userClubRelation) {
      return NextResponse.json(
        { error: "Usuario sin club asignado" },
        { status: 403 }
      );
    }

    const { eventId } = params;
    const { serie } = await req.json();

    // Verificar que el evento existe
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        clubId: userClubRelation.clubId,
        isInternalCompetition: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Validar que los nadadores no se repitan en el evento
    const swimmerIds = serie.swimmers
      .filter((s: any) => s.swimmerId)
      .map((s: any) => s.swimmerId);

    if (swimmerIds.length > 0) {
      const existingSwimmers = await prisma.heatLane.findMany({
        where: {
          eventId: eventId,
          swimmerId: { in: swimmerIds },
        },
      });

      if (existingSwimmers.length > 0) {
        return NextResponse.json(
          { error: "Algunos nadadores ya están en otra serie" },
          { status: 400 }
        );
      }
    }

    // Obtener los profesores asignados desde la configuración del evento
    const eventConfig = await prisma.event.findUnique({
      where: { id: eventId },
      select: { categoryDistances: true },
    });

    if (!eventConfig?.categoryDistances) {
      return NextResponse.json(
        { error: "No hay carriles configurados" },
        { status: 400 }
      );
    }

    const config = JSON.parse(eventConfig.categoryDistances);
    const laneCoaches = config.laneCoaches || [];
    
    const laneCoachMap = new Map(
      laneCoaches.map((lc: any) => [lc.lane, lc.coachId])
    );

    // Crear registros HeatLane para esta serie
    const heatLanesToCreate = serie.swimmers
      .filter((s: any) => s.swimmerId) // Solo crear para carriles con nadador
      .map((s: any) => ({
        eventId: eventId,
        lane: s.lane,
        heatNumber: serie.number,
        swimmerId: s.swimmerId,
        coachId: laneCoachMap.get(s.lane)!, // Usar el profesor asignado a ese carril
      }));

    await prisma.heatLane.createMany({
      data: heatLanesToCreate,
    });

    return NextResponse.json({
      success: true,
      message: `Serie ${serie.number} creada correctamente`,
    });
  } catch (error) {
    console.error("Error creando serie:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
