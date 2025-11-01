import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Requiere ADMIN autenticado
    await requireAuth(request as unknown as Request, ['ADMIN'])

    const { id: clubId } = await params;

    // Verificar si el club tiene credenciales (usuario asociado)
    const userClub = await (prisma as any).userClub.findFirst({
      where: { clubId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      hasCredentials: !!userClub,
      user: userClub?.user || null
    });

  } catch (error) {
    console.error('Error checking club credentials:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}