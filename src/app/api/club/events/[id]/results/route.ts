import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCategory } from "@/lib/categories";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN', 'TEACHER']);
    const { id } = await context.params;

    // Obtener el evento
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        heatLanes: {
          include: {
            heat: true,
            swimmer: {
              select: {
                id: true,
                name: true,
                birthDate: true,
              }
            }
          },
          where: {
            finalTime: {
              not: null
            }
          },
          orderBy: {
            finalTime: 'asc'
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    // Agrupar resultados por categoría
    const resultsByCategory: Record<string, any[]> = {};
    
    event.heatLanes.forEach((lane) => {
      if (!lane.swimmer || !lane.finalTime) return;
      
      const category = calculateCategory(lane.swimmer.birthDate);
      const categoryKey = category.code;
      
      if (!resultsByCategory[categoryKey]) {
        resultsByCategory[categoryKey] = [];
      }
      
      resultsByCategory[categoryKey].push({
        position: 0, // Se calculará después
        swimmer: {
          id: lane.swimmer.id,
          name: lane.swimmer.name,
        },
        time: lane.finalTime,
        heatNumber: lane.heat.number,
        laneNumber: lane.lane,
      });
    });

    // Ordenar cada categoría por tiempo y asignar posiciones
    Object.keys(resultsByCategory).forEach((categoryKey) => {
      resultsByCategory[categoryKey].sort((a, b) => a.time - b.time);
      resultsByCategory[categoryKey].forEach((result, index) => {
        result.position = index + 1;
      });
    });

    // Convertir a formato de respuesta con nombres de categoría
    const categories = Object.entries(resultsByCategory).map(([code, results]) => {
      const category = calculateCategory('2000-01-01'); // Para obtener estructura
      const categoryInfo = [
        { code: 'pre_minima', name: 'PRE-MÍNIMA' },
        { code: 'minima_1', name: 'MÍNIMA 1' },
        { code: 'minima_2', name: 'MÍNIMA 2' },
        { code: 'infantil_a1', name: 'INFANTIL A1' },
        { code: 'infantil_a2', name: 'INFANTIL A2' },
        { code: 'infantil_b', name: 'INFANTIL B' },
        { code: 'juvenil', name: 'JUVENIL & MAYORES' },
        { code: 'mayores', name: 'MAYORES' },
      ].find(c => c.code === code);

      return {
        code,
        name: categoryInfo?.name || code.toUpperCase(),
        results
      };
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        distance: event.distance,
        style: event.style,
        startDate: event.startDate,
        location: event.location,
      },
      categories: categories.sort((a, b) => a.name.localeCompare(b.name)),
    });

  } catch (error) {
    console.error("Error al obtener resultados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
