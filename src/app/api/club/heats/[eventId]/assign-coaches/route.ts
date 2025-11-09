import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { clubId } = userClubRelation;
    const { eventId } = params;
    const { laneCoaches } = await req.json();

    // Verificar que el evento existe y pertenece al club
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        clubId: clubId,
        isInternalCompetition: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado o no es competencia interna" },
        { status: 404 }
      );
    }

    // Validar que todos los coaches existen y pertenecen al club
    const coachIds = laneCoaches.map((lc: any) => lc.coachId);
    const coaches = await prisma.user.findMany({
      where: {
        id: { in: coachIds },
        role: "TEACHER",
        userClubs: {
          some: { clubId: clubId },
        },
      },
    });

    if (coaches.length !== coachIds.length) {
      return NextResponse.json(
        { error: "Algunos profesores no son válidos" },
        { status: 400 }
      );
    }

    // Guardar asignación de profesores en un campo del evento
    // Actualizamos el evento para almacenar la configuración de carriles/profesores
    await prisma.event.update({
      where: { id: eventId },
      data: {
        lanes: laneCoaches.length,
        // Guardamos la configuración en categoryDistances como JSON temporal
        categoryDistances: JSON.stringify({
          laneCoaches: laneCoaches,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profesores asignados correctamente",
    });
  } catch (error) {
    console.error("Error asignando profesores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
