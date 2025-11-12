import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; heatId: string } }
) {
  try {
    const { times } = await request.json();
    
    if (!Array.isArray(times) || times.length === 0) {
      return NextResponse.json(
        { error: "No times provided" },
        { status: 400 }
      );
    }

    console.log('💾 Guardando tiempos en BD:', {
      heatId: params.heatId,
      timesCount: times.length,
      times
    });

    // Actualizar cada carril con su tiempo final
    const updatePromises = times.map(({ laneId, finalTime }) =>
      prisma.heatLane.update({
        where: { id: laneId },
        data: { finalTime }
      })
    );

    await Promise.all(updatePromises);

    console.log('✅ Tiempos guardados exitosamente');

    return NextResponse.json({ 
      success: true,
      message: "Times saved successfully"
    });
  } catch (error) {
    console.error("Error saving times:", error);
    return NextResponse.json(
      { error: "Failed to save times" },
      { status: 500 }
    );
  }
}
