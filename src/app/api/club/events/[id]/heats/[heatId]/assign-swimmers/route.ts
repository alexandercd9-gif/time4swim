import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; heatId: string }> }
) {
  try {
    const { user } = await requireAuth(request);
    const { id: eventId } = await params;
    
    const body = await request.json();
    const { assignments } = body; // Array de { laneId, swimmerId }

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "assignments debe ser un array" },
        { status: 400 }
      );
    }

    // Verificar acceso al club
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
        userId: user.id,
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

    // Verificar que los carriles pertenecen al evento
    if (assignments.length > 0) {
      const laneIds = assignments.map(a => a.laneId);
      const lanes = await prisma.heatlane.findMany({
        where: {
          id: { in: laneIds },
          eventId
        }
      });

      if (lanes.length !== laneIds.length) {
        return NextResponse.json(
          { error: "Algunos carriles no pertenecen a este evento" },
          { status: 400 }
        );
      }
    }

    // Actualizar cada carril con su nadador
    await Promise.all(
      assignments.map(({ laneId, swimmerId }) =>
        prisma.heatlane.update({
          where: { id: laneId },
          data: { swimmerId }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning swimmers:", error);
    return NextResponse.json(
      { error: "Error al asignar nadadores" },
      { status: 500 }
    );
  }
}
