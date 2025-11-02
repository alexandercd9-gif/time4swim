import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/parent/best-times?source=COMPETITION|TRAINING&childId=
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["ADMIN", "PARENT"]);
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get("source") || "COMPETITION").toUpperCase();
    const childId = searchParams.get("childId");

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
        allowedChildIds = Array.from(set);
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

    const result: Record<string, number | null> = Object.fromEntries(styles.map((s) => [s, null]));

    if (source === "TRAINING") {
      const trainings = await prisma.training.findMany({
        where: { childId: { in: allowedChildIds } },
        select: { style: true, time: true },
      });
      for (const t of trainings) {
        const current = result[t.style as string];
        if (current == null || t.time < current) result[t.style as string] = t.time;
      }
    } else {
      const records = await prisma.record.findMany({
        where: { childId: { in: allowedChildIds } },
        select: { style: true, time: true },
      });
      for (const r of records) {
        const current = result[r.style as string];
        if (current == null || r.time < current) result[r.style as string] = r.time;
      }
    }

    return NextResponse.json({ bestTimes: result });
  } catch (error) {
    console.error("GET /api/parent/best-times error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
