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
    const { laneCoaches } = await request.json();

    if (!laneCoaches || !Array.isArray(laneCoaches)) {
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

    const userClub = await prisma.userClub.findFirst({
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

    // Eliminar carriles existentes del evento
    await prisma.heatLane.deleteMany({
      where: { eventId }
    });

    // Crear los nuevos carriles con los profesores asignados
    // Crear solo una serie inicial
    const heatLanesToCreate = laneCoaches.map((lc: any) => ({
      eventId,
      lane: lc.lane,
      heatNumber: 1, // Serie 1 por defecto
      coachId: lc.coachId,
      swimmerId: null // Se asignará después en el control
    }));

    await prisma.heatLane.createMany({
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
