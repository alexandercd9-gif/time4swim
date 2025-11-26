import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(request, ["CLUB"]);
    const { id: eventId } = await params;
    const { laneCoaches, lanes, heatNumber } = await request.json();

    // Soporte para ambos formatos: laneCoaches (viejo) y lanes (nuevo)
    const lanesData = lanes || laneCoaches;
    const serieNumber = heatNumber || 1;

    if (!lanesData || !Array.isArray(lanesData)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario pertenece al club del evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clubId: true, lanes: true }
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

    // Si es Serie 1, eliminar carriles existentes (comportamiento original)
    // Si es Serie 2+, NO eliminar, solo agregar nuevos carriles
    if (serieNumber === 1) {
      await prisma.heatlane.deleteMany({
        where: { eventId }
      });
    }

    // Crear los nuevos carriles con los profesores asignados
    const heatLanesToCreate = lanesData.map((lc: any) => ({
      id: `HL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${lc.lane}`,
      eventId,
      lane: lc.lane,
      heatNumber: serieNumber,
      coachId: lc.coachId || lc.coach?.id,
      swimmerId: null, // Se asignará después en el control
      updatedAt: new Date()
    }));

    await prisma.heatlane.createMany({
      data: heatLanesToCreate
    });

    // Notificar a los profesores vía Pusher
    try {
      await fetch(`${request.url.split('/api')[0]}/api/pusher/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'profesor-updates',
          event: 'lanes-assigned',
          data: {
            eventId,
            message: 'Se han asignado nuevos carriles',
            timestamp: Date.now()
          }
        })
      });
    } catch (pushError) {
      console.error('Error sending Pusher notification:', pushError);
      // No fallar si Pusher falla
    }

    return NextResponse.json({
      success: true,
      message: "Carriles asignados correctamente"
    });

  } catch (error) {
    console.error("Error assigning lanes:", error);
    return NextResponse.json(
      { error: "Error al asignar carriles" },
      { status: 500 }
    );
  }
}
