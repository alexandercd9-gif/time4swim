import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('🔍 Buscando entrenadores para club:', id);

    // Buscar entrenadores asociados al club a través de UserClub
    const userClubs = await (prisma as any).userclub.findMany({
      where: {
        clubId: id,
        isActive: true,
        user: {
          role: 'TEACHER'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const coaches = userClubs.map((uc: any) => uc.user);

    console.log('👥 Entrenadores encontrados:', coaches.length);

    return NextResponse.json(coaches);
  } catch (error) {
    console.error('❌ Error al obtener entrenadores:', error);
    return NextResponse.json(
      { error: 'Error al obtener entrenadores' },
      { status: 500 }
    );
  }
}
