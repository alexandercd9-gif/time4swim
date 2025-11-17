import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// Helpers
function getMonthRange(year: number, month: number) {
  // month: 1-12
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // first day next month
  return { start, end };
}

// GET /api/trainings?childId=...&month=...&year=...&style=...
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["ADMIN", "PARENT"]);
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const style = searchParams.get("style");

    if (!childId) {
      return NextResponse.json({ error: "childId es requerido" }, { status: 400 });
    }

    // Si es PARENT, validar que el hijo le pertenece
    if (auth.user.role === "PARENT") {
      const relation = await (prisma as any).userChild.findFirst({
        where: { userId: auth.user.id, childId, isActive: true },
      });
      if (!relation) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    const now = new Date();
    const month = monthParam ? parseInt(monthParam) : now.getUTCMonth() + 1; // 1-12
    const year = yearParam ? parseInt(yearParam) : now.getUTCFullYear();
    const { start, end } = getMonthRange(year, month);

    // Buscar entrenamientos regulares
    const trainings = await prisma.training.findMany({
      where: {
        childId,
        date: { gte: start, lt: end },
        ...(style && style !== "ALL" ? { style: style as any } : {}),
      },
      orderBy: { date: "asc" },
      select: { id: true, date: true, time: true, distance: true, style: true },
    });

    // Buscar competencias internas en el mismo rango de fecha
    const internalCompetitions = await prisma.heatLane.findMany({
      where: {
        swimmerId: childId,
        finalTime: { not: null },
        event: {
          isInternalCompetition: true,
          startDate: { gte: start, lt: end },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            startDate: true,
            style: true,
            distance: true,
          },
        },
      },
    });

    // Convertir competencias internas al formato de training
    const internalAsTrainings = internalCompetitions
      .filter((lane) => {
        const matchesStyle = !style || style === "ALL" || lane.event.style === style;
        return matchesStyle && lane.event.style && lane.event.distance;
      })
      .map((lane) => ({
        id: `internal-${lane.id}`,
        date: lane.event.startDate,
        time: lane.finalTime! / 1000, // Convertir de milisegundos a segundos
        distance: lane.event.distance!,
        style: lane.event.style!,
      }));

    // Combinar ambas fuentes y ordenar por fecha
    const allTrainings = [...trainings, ...internalAsTrainings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ trainings: allTrainings });
  } catch (error) {
    console.error("GET /api/trainings error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/trainings
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["ADMIN", "PARENT"]);
    const body = await request.json();
    const { childId, style, distance, time, date, notes, laps, poolType } = body;

    if (!childId || !style || !distance || !time) {
      return NextResponse.json({ error: "Campos requeridos: childId, style, distance, time" }, { status: 400 });
    }

    // Validar relación padre-hijo para PARENT
    if (auth.user.role === "PARENT") {
      const relation = await (prisma as any).userChild.findFirst({
        where: { userId: auth.user.id, childId, isActive: true },
      });
      if (!relation) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    const created = await prisma.training.create({
      data: {
        childId,
        style,
        distance: Number(distance),
        time: Number(time),
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        laps: laps || null,
        poolType: poolType || null,
      } as any,
      select: { id: true, childId: true, style: true, distance: true, time: true, date: true, laps: true, poolType: true } as any,
    });

    return NextResponse.json({ training: created });
  } catch (error) {
    console.error("POST /api/trainings error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
