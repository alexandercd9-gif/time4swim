import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ laneId: string }> }
) {
  try {
    const { laneId } = await params;

    const lane = await prisma.heatLane.findUnique({
      where: { id: laneId },
      include: {
        swimmer: {
          select: {
            id: true,
            name: true,
            lastName: true,
            birthDate: true
          }
        }
      }
    });

    if (!lane) {
      return NextResponse.json(
        { error: 'Carril no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(lane);

  } catch (error) {
    console.error('Error fetching lane:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
