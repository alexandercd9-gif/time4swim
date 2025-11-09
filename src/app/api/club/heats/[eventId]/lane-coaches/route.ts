import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await requireAuth(req as any, ['CLUB', 'ADMIN', 'TEACHER']);

    const { eventId } = params;

    // Obtener configuración del evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        categoryDistances: true,
      },
    });

    if (!event || !event.categoryDistances) {
      return NextResponse.json({ laneCoaches: [] });
    }

    // Parsear configuración de profesores
    try {
      const config = JSON.parse(event.categoryDistances);
      const laneCoachesData = config.laneCoaches || [];
      
      // Obtener nombres de los profesores
      const coachIds = laneCoachesData.map((lc: any) => lc.coachId);
      const coaches = await prisma.user.findMany({
        where: { id: { in: coachIds } },
        select: { id: true, name: true },
      });
      
      const coachMap = new Map(coaches.map(c => [c.id, c.name]));
      
      const laneCoaches = laneCoachesData.map((lc: any) => ({
        lane: lc.lane,
        coachId: lc.coachId,
        coachName: coachMap.get(lc.coachId) || "Sin nombre",
      }));

      return NextResponse.json({ laneCoaches });
    } catch (parseError) {
      console.error("Error parsing config:", parseError);
      return NextResponse.json({ laneCoaches: [] });
    }
  } catch (error) {
    console.error("Error obteniendo profesores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
