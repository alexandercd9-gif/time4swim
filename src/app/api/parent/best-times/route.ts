import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/parent/best-times?source=COMPETITION|TRAINING|INTERNAL_COMPETITION&childId=&distance=
// Si no se especifica source, busca en TODAS las fuentes
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["ADMIN", "PARENT"]);
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source")?.toUpperCase() || null;
    const childId = searchParams.get("childId");
    const distance = searchParams.get("distance");
    const distanceNum = distance ? parseInt(distance, 10) : null;
    
    console.log('🔍 Best-times API llamado:', { source: source || 'ALL', childId, distance: distanceNum });

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
      result[`${s}_source`] = null;
    });

    // Función auxiliar para actualizar el mejor tiempo
    const updateBestTime = (style: string, time: number, distance: number | null, source: string, laps?: any, lapsData?: any) => {
      const current = result[style];
      if (current == null || time < current) {
        result[style] = time;
        result[`${style}_distance`] = distance;
        result[`${style}_source`] = source;
        result[`${style}_laps`] = laps || null;
        result[`${style}_lapsData`] = lapsData || null;
      }
    };

    // Si no hay source, buscar en TODAS las fuentes
    if (!source) {
      console.log('🔍 Buscando en TODAS las fuentes...');
      
      // 1. Buscar en COMPETITION (Record)
      const whereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) whereClause.distance = distanceNum;
      
      const records = await prisma.record.findMany({
        where: whereClause,
        select: { style: true, time: true, distance: true },
      });
      
      for (const r of records) {
        updateBestTime(r.style as string, r.time, r.distance, 'COMPETITION');
      }
      
      // 2. Buscar en TRAINING
      const trainings = await prisma.training.findMany({
        where: whereClause,
        select: { style: true, time: true, laps: true, distance: true } as any,
      });
      
      for (const t of trainings as any[]) {
        const lapsCount = t.laps && Array.isArray(t.laps) ? t.laps.length : null;
        updateBestTime(t.style as string, t.time, t.distance, 'TRAINING', lapsCount, t.laps);
      }
      
      // 3. Buscar en INTERNAL_COMPETITION (HeatLane)
      const heatLanes = await prisma.heatLane.findMany({
        where: {
          swimmerId: { in: allowedChildIds },
          finalTime: { not: null },
        },
        select: {
          finalTime: true,
          event: {
            select: {
              style: true,
              distance: true,
            },
          },
        },
      });
      
      for (const lane of heatLanes) {
        if (!lane.finalTime || !lane.event?.style) continue;
        if (distanceNum != null && lane.event.distance !== distanceNum) continue;
        
        const timeInSeconds = lane.finalTime / 1000;
        updateBestTime(lane.event.style as string, timeInSeconds, lane.event.distance || null, 'INTERNAL_COMPETITION');
      }
      
      console.log('✅ Búsqueda en todas las fuentes completada');
    } else if (source === "TRAINING") {
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
          result[`${t.style}_source`] = 'TRAINING';
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
    } else if (source === "INTERNAL_COMPETITION") {
      console.log('⏱️ Consultando competencias internas para:', allowedChildIds);
      
      // Consultar tiempos de competencias internas desde HeatLane
      // NOTA: finalTime está en milisegundos, necesitamos convertir a segundos
      const heatLanes = await prisma.heatLane.findMany({
        where: {
          swimmerId: { in: allowedChildIds },
          finalTime: { not: null },
        },
        select: {
          finalTime: true,
          event: {
            select: {
              style: true,
              distance: true,
            },
          },
        },
      });
      
      console.log(`✅ Encontrados ${heatLanes.length} carriles con tiempos`);

      for (const lane of heatLanes) {
        if (!lane.finalTime || !lane.event?.style) continue;
        
        const style = lane.event.style;
        const current = result[style as string];
        
        // Filtrar por distancia si se especificó
        if (distanceNum != null && lane.event.distance !== distanceNum) continue;
        
        // Convertir de milisegundos a segundos
        const timeInSeconds = lane.finalTime / 1000;
        
        if (current == null || timeInSeconds < current) {
          result[style as string] = timeInSeconds;
          result[`${style}_distance`] = lane.event.distance || null;
          result[`${style}_source`] = 'INTERNAL_COMPETITION';
          result[`${style}_laps`] = null;
          result[`${style}_lapsData`] = null;
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
          result[`${r.style}_source`] = 'COMPETITION';
          result[`${r.style}_laps`] = null;
          result[`${r.style}_lapsData`] = null;
        }
      }
    }

    console.log('📊 Resultado final:', result);
    return NextResponse.json({ bestTimes: result });
  } catch (error) {
    console.error("GET /api/parent/best-times error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
