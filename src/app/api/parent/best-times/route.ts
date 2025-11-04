import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/parent/best-times?source=COMPETITION|TRAINING&childId=&distance=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["ADMIN", "PARENT"]);
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get("source") || "COMPETITION").toUpperCase();
    const childId = searchParams.get("childId");
    const distance = searchParams.get("distance");
    const distanceNum = distance ? parseInt(distance, 10) : null;

    // Determinar hijos permitidos
    let allowedChildIds: string[] = [];
    if (auth.user.role === "ADMIN") {
      if (childId) allowedChildIds = [childId];
      else {
        const all = await prisma.child.findMany({ select: { id: true } });
        allowedChildIds = all.map((c) => c.id);
      }
    } else {
      const relations = await (prisma as any).userChild.findMany({
        where: { userId: auth.user.id, isActive: true },
        select: { childId: true },
      });
      const set = new Set(relations.map((r: any) => r.childId));
      if (childId) {
        if (!set.has(childId)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        allowedChildIds = [childId];
      } else {
        allowedChildIds = Array.from(set) as string[];
      }
    }

    const styles = [
      "FREESTYLE",
      "BACKSTROKE",
      "BREASTSTROKE",
      "BUTTERFLY",
      "INDIVIDUAL_MEDLEY",
      "MEDLEY_RELAY",
    ];

    const result: Record<string, any> = {};
    styles.forEach((s) => {
      result[s] = null;
      result[`${s}_laps`] = null;
      result[`${s}_distance`] = null;
    });

    if (source === "TRAINING") {
      const whereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) whereClause.distance = distanceNum;

      const trainings = await prisma.training.findMany({
        where: whereClause,
        select: { style: true, time: true, laps: true, distance: true } as any,
      });
      for (const t of trainings as any[]) {
        const current = result[t.style as string];
        if (current == null || t.time < current) {
          result[t.style as string] = t.time;
          result[`${t.style}_distance`] = t.distance;
          // Store laps info
          if (t.laps && Array.isArray(t.laps)) {
            result[`${t.style}_laps`] = t.laps.length;
            result[`${t.style}_lapsData`] = t.laps;
          } else {
            result[`${t.style}_laps`] = null;
            result[`${t.style}_lapsData`] = null;
          }
        }
      }
    } else {
      const whereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) whereClause.distance = distanceNum;

      const records = await prisma.record.findMany({
        where: whereClause,
        select: { style: true, time: true, distance: true },
      });
      for (const r of records) {
        const current = result[r.style as string];
        if (current == null || r.time < current) {
          result[r.style as string] = r.time;
          result[`${r.style}_distance`] = r.distance;
          result[`${r.style}_laps`] = null;
          result[`${r.style}_lapsData`] = null;
        }
      }
    }

    return NextResponse.json({ bestTimes: result });
  } catch (error) {
    console.error("GET /api/parent/best-times error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
