import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    const { id } = await context.params;
    const body = await request.json();
    const { unassignedSwimmers } = body;

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Verificar permisos
    if (auth.user.role === 'CLUB') {
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
      });

      if (!userClubRelation || event.clubId !== userClubRelation.clubId) {
        return NextResponse.json(
          { error: "No tienes permiso para finalizar este evento" },
          { status: 403 }
        );
      }
    }

    // Actualizar el estado del evento a finalizado
    // Actualizamos el updatedAt para que sea diferente del createdAt
    // Esto nos permite identificar eventos finalizados
    const finishedEvent = await prisma.event.update({
      where: { id },
      data: {
        updatedAt: new Date()
      }
    });
    
    // Marcar el evento como finalizado actualizando su descripción con un flag
    await prisma.event.update({
      where: { id },
      data: {
        description: `COMPLETED:${new Date().toISOString()}|${finishedEvent.description || ''}`
      }
    });

    // Opcional: Registrar los nadadores ausentes en una tabla de logs
    // Si tienes una tabla EventParticipants o similar, podrías marcarlos como ausentes
    if (unassignedSwimmers && unassignedSwimmers.length > 0) {
      console.log(`📝 Nadadores marcados como ausentes en evento ${id}:`, unassignedSwimmers);
      // Aquí podrías crear registros en una tabla de participación con status 'ABSENT'
      // Por ejemplo:
      // await prisma.eventParticipant.createMany({
      //   data: unassignedSwimmers.map((swimmerId: string) => ({
      //     eventId: id,
      //     swimmerId,
      //     status: 'ABSENT'
      //   }))
      // });
    }

    console.log(`✅ Evento ${id} finalizado exitosamente`);

    return NextResponse.json({
      success: true,
      message: "Evento finalizado exitosamente",
      unassignedCount: unassignedSwimmers?.length || 0
    });

  } catch (error) {
    console.error("Error al finalizar evento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
