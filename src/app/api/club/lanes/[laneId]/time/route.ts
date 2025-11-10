import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ laneId: string }> }
) {
  try {
    const { laneId } = await params;
    const body = await req.json();
    const { finalTime } = body;

    if (typeof finalTime !== 'number') {
      return NextResponse.json(
        { error: 'finalTime debe ser un número' },
        { status: 400 }
      );
    }

    // Actualizar el tiempo final del carril
    const updatedLane = await prisma.heatLane.update({
      where: { id: laneId },
      data: { finalTime },
      include: {
        swimmer: {
          select: {
            id: true,
            name: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      lane: updatedLane
    });

  } catch (error) {
    console.error('Error saving lane time:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
