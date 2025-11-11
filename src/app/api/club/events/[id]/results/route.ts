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
            swimmer: {
              select: {
                id: true,
                name: true,
                birthDate: true,
                gender: true,
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

    // Agrupar resultados por categoría Y género
    const resultsByCategoryAndGender: Record<string, any[]> = {};
    
    event.heatLanes.forEach((lane) => {
      if (!lane.swimmer || !lane.finalTime) return;
      
      const category = calculateCategory(lane.swimmer.birthDate);
      const gender = lane.swimmer.gender || 'MALE'; // Default a MALE si no está definido
      const genderLabel = gender === 'FEMALE' ? 'Niñas' : 'Niños';
      
      // Clave combinada: categoría + género
      const categoryKey = `${category.code}_${gender}`;
      
      if (!resultsByCategoryAndGender[categoryKey]) {
        resultsByCategoryAndGender[categoryKey] = [];
      }
      
      resultsByCategoryAndGender[categoryKey].push({
        position: 0, // Se calculará después
        categoryCode: category.code,
        gender: gender,
        genderLabel: genderLabel,
        swimmer: {
          id: lane.swimmer.id,
          name: lane.swimmer.name,
        },
        time: lane.finalTime,
        heatNumber: lane.heatNumber,
        laneNumber: lane.lane,
      });
    });

    // Ordenar cada categoría+género por tiempo y asignar posiciones
    Object.keys(resultsByCategoryAndGender).forEach((categoryKey) => {
      resultsByCategoryAndGender[categoryKey].sort((a, b) => a.time - b.time);
      resultsByCategoryAndGender[categoryKey].forEach((result, index) => {
        result.position = index + 1;
      });
    });

    // Convertir a formato de respuesta con nombres de categoría y género
    const categories = Object.entries(resultsByCategoryAndGender).map(([key, results]) => {
      // Extraer código de categoría y género de la primera entrada
      const firstResult = results[0];
      const categoryCode = firstResult.categoryCode;
      const gender = firstResult.gender;
      const genderLabel = firstResult.genderLabel;
      
      const categoryInfo = [
        { code: 'pre_minima', name: 'PRE-MÍNIMA' },
        { code: 'minima_1', name: 'MÍNIMA 1' },
        { code: 'minima_2', name: 'MÍNIMA 2' },
        { code: 'infantil_a1', name: 'INFANTIL A1' },
        { code: 'infantil_a2', name: 'INFANTIL A2' },
        { code: 'infantil_b', name: 'INFANTIL B' },
        { code: 'juvenil', name: 'JUVENIL & MAYORES' },
        { code: 'mayores', name: 'MAYORES' },
      ].find(c => c.code === categoryCode);

      return {
        code: key,
        categoryCode: categoryCode,
        gender: gender,
        name: `${categoryInfo?.name || categoryCode.toUpperCase()} - ${genderLabel}`,
        results: results.map(r => ({
          position: r.position,
          swimmer: r.swimmer,
          time: r.time,
          heatNumber: r.heatNumber,
          laneNumber: r.laneNumber,
        }))
      };
    });

    // Ordenar por categoría y luego por género (niños primero, niñas después)
    const sortedCategories = categories.sort((a, b) => {
      const categoryOrder = ['pre_minima', 'minima_1', 'minima_2', 'infantil_a1', 'infantil_a2', 'infantil_b', 'juvenil', 'mayores'];
      const aOrder = categoryOrder.indexOf(a.categoryCode);
      const bOrder = categoryOrder.indexOf(b.categoryCode);
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Si misma categoría, ordenar por género (MALE primero, FEMALE después)
      return a.gender === 'MALE' ? -1 : 1;
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
      categories: sortedCategories,
    });

  } catch (error) {
    console.error("Error al obtener resultados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
