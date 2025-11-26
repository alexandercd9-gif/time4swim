import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Devuelve las distancias únicas utilizadas en competencias y entrenamientos
export async function GET(request: NextRequest) {
  try {
    // Obtener distancias únicas de competitions
    const competitionDistances = await (prisma as any).competition.findMany({
      where: {
        distance: { not: null }
      },
      select: {
        distance: true
      },
      distinct: ['distance']
    });

    // Obtener distancias únicas de trainings
    const trainingDistances = await (prisma as any).training.findMany({
      where: {
        distance: { not: null }
      },
      select: {
        distance: true
      },
      distinct: ['distance']
    });

    // Combinar y ordenar distancias únicas
    const allDistances = [
      ...competitionDistances.map((c: any) => c.distance),
      ...trainingDistances.map((t: any) => t.distance)
    ];

    const uniqueDistances = [...new Set(allDistances)]
      .filter(d => d && d > 0)
      .sort((a, b) => a - b)
      .map(distance => ({
        value: distance.toString(),
        label: `${distance}m`
      }));

    return NextResponse.json(uniqueDistances);
  } catch (error) {
    console.error('Error en /api/config/distances:', error);
    return NextResponse.json({ error: "Error al obtener distancias" }, { status: 500 });
  }
}
