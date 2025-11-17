import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req as any, ["ADMIN", "PARENT"]);

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!childId || !year || !month) {
    return NextResponse.json(
      { error: "Se requieren childId, year y month" },
      { status: 400 }
    );
  }

  try {
    // Verificar que el niño pertenece al padre/usuario actual (si no es admin)
    if (auth.user.role !== "ADMIN") {
      const relation = await (prisma as any).userChild.findFirst({
        where: {
          userId: auth.user.id,
          childId: childId,
          isActive: true,
        },
      });

      if (!relation) {
        return NextResponse.json(
          { error: "Nadador no encontrado o no autorizado" },
          { status: 404 }
        );
      }
    }

    // Calcular rango de fechas para el mes seleccionado
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    const startDate = new Date(yearNum, monthNum - 1, 1); // Primer día del mes
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Último día del mes

    // Obtener todos los entrenamientos del mes
    const trainings = await (prisma.training as any).findMany({
      where: {
        childId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        style: true,
        distance: true,
        time: true,
        date: true,
        laps: true,
        poolType: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      trainings,
      count: trainings.length,
    });
  } catch (error) {
    console.error("Error fetching training history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial de entrenamientos" },
      { status: 500 }
    );
  }
}
