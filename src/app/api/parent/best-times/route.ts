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
    const poolType = searchParams.get("poolType") || null;
    const distanceNum = distance ? parseInt(distance, 10) : null;
    
    console.log('🔍 Best-times API llamado:', { source: source || 'ALL', childId, distance: distanceNum, poolType });

    // Determinar hijos permitidos
    let allowedChildIds: string[] = [];
    if (auth.user.role === "ADMIN") {
      if (childId) allowedChildIds = [childId];
      else {
        const all = await prisma.child.findMany({ select: { id: true } });
        allowedChildIds = all.map((c) => c.id);
      }
    } else {
      const relations = await (prisma as any).userchild.findMany({
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
    ];

    const result: Record<string, any> = {};
    styles.forEach((s) => {
      result[s] = null;
      result[`${s}_laps`] = null;
      result[`${s}_distance`] = null;
      result[`${s}_source`] = null;
      result[`${s}_bestDate`] = null;
      result[`${s}_lastTime`] = null;
      result[`${s}_lastDate`] = null;
      result[`${s}_allTimes`] = [];
      result[`${s}_competitionName`] = null;
    });

    // Función auxiliar para actualizar el mejor tiempo
    const updateBestTime = (style: string, time: number, distance: number | null, source: string, date: Date, laps?: any, lapsData?: any, competitionName?: string) => {
      const current = result[style];
      if (current == null || time < current) {
        result[style] = time;
        result[`${style}_distance`] = distance;
        result[`${style}_source`] = source;
        result[`${style}_laps`] = laps || null;
        result[`${style}_lapsData`] = lapsData || null;
        result[`${style}_bestDate`] = date;
        result[`${style}_competitionName`] = competitionName || null;
      }
    };
    
    // Función auxiliar para agregar todos los tiempos (para progresión)
    const addAllTime = (style: string, time: number, date: Date) => {
      result[`${style}_allTimes`].push({ time, date });
    };

    // Si no hay source, buscar en TODAS las fuentes
    if (!source) {
      console.log('🔍 Buscando en TODAS las fuentes...');
      
      // 1. Buscar en COMPETITION (Record)
      const recordWhereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) recordWhereClause.distance = distanceNum;
      if (poolType) recordWhereClause.poolSize = poolType;
      
      const records = await prisma.record.findMany({
        where: recordWhereClause,
        select: { style: true, time: true, distance: true, date: true, poolSize: true, competition: true },
        orderBy: { date: 'desc' },
      });
      
      for (const r of records) {
        // Solo agregar si no hay filtro de distancia o si coincide
        if (!distanceNum || r.distance === distanceNum) {
          updateBestTime(r.style as string, r.time, r.distance, 'COMPETITION', r.date, null, null, r.competition);
          addAllTime(r.style as string, r.time, r.date);
        }
      }
      
      // 2. Buscar en TRAINING
      const trainingWhere: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) trainingWhere.distance = distanceNum;
      if (poolType) trainingWhere.poolType = poolType;
      
      const trainings = await prisma.training.findMany({
        where: trainingWhere,
        select: { 
          style: true, 
          time: true, 
          laps: true, 
          distance: true, 
          createdAt: true, 
          poolType: true 
        },
        orderBy: { createdAt: 'desc' },
      });
      
      for (const t of trainings as any[]) {
        // Solo agregar si no hay filtro de distancia o si coincide
        if (!distanceNum || t.distance === distanceNum) {
          const lapsCount = t.laps && Array.isArray(t.laps) ? t.laps.length : null;
          updateBestTime(t.style as string, t.time, t.distance, 'TRAINING', t.createdAt, lapsCount, t.laps);
          addAllTime(t.style as string, t.time, t.createdAt);
        }
      }
      
      // 3. Buscar en INTERNAL_COMPETITION (HeatLane) - Solo si NO hay filtro de poolType
      if (!poolType) {
        const heatLanes = await prisma.heatlane.findMany({
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
          const date = (lane as any).createdAt || new Date();
          updateBestTime(lane.event.style as string, timeInSeconds, lane.event.distance || null, 'INTERNAL_COMPETITION', date);
          addAllTime(lane.event.style as string, timeInSeconds, date);
        }
      }
      
      console.log('✅ Búsqueda en todas las fuentes completada');
    } else if (source === "TRAINING") {
      const whereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) whereClause.distance = distanceNum;
      if (poolType) whereClause.poolType = poolType;

      const trainings = await prisma.training.findMany({
        where: whereClause,
        select: { style: true, time: true, laps: true, distance: true, poolType: true } as any,
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
      const heatLanes = await prisma.heatlane.findMany({
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
      // source === "COMPETITION"
      const whereClause: any = { childId: { in: allowedChildIds } };
      if (distanceNum != null) whereClause.distance = distanceNum;
      if (poolType) whereClause.poolSize = poolType;

      const records = await prisma.record.findMany({
        where: whereClause,
        select: { style: true, time: true, distance: true, competition: true },
      });
      for (const r of records) {
        const current = result[r.style as string];
        if (current == null || r.time < current) {
          result[r.style as string] = r.time;
          result[`${r.style}_distance`] = r.distance;
          result[`${r.style}_source`] = 'COMPETITION';
          result[`${r.style}_laps`] = null;
          result[`${r.style}_lapsData`] = null;
          result[`${r.style}_competitionName`] = r.competition;
        }
      }
    }

    // Calcular último tiempo y métricas avanzadas para cada estilo
    styles.forEach((style) => {
      const allTimes = result[`${style}_allTimes`];
      if (allTimes && allTimes.length > 0) {
        // Ordenar por fecha (más reciente primero)
        allTimes.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        result[`${style}_lastTime`] = allTimes[0].time;
        result[`${style}_lastDate`] = allTimes[0].date;
        
        // 📊 INDICADORES AVANZADOS
        const bestTime = result[style]; // PB (Personal Best)
        const lastTime = allTimes[0].time;
        
        // 1. Delta vs PB
        if (bestTime != null) {
          result[`${style}_deltaVsPB`] = lastTime - bestTime;
        }
        
        // 2. SB (Season Best) - Mejor tiempo del año actual
        const currentYear = new Date().getFullYear();
        const thisYearTimes = allTimes.filter((t: any) => new Date(t.date).getFullYear() === currentYear);
        if (thisYearTimes.length > 0) {
          const seasonBest = Math.min(...thisYearTimes.map((t: any) => t.time));
          result[`${style}_seasonBest`] = seasonBest;
          result[`${style}_seasonBestDate`] = thisYearTimes.find((t: any) => t.time === seasonBest)?.date;
          
          // Delta vs SB
          result[`${style}_deltaVsSB`] = lastTime - seasonBest;
        }
        
        // 3. Promedio últimos 5 entrenamientos (solo de source TRAINING)
        // Necesitamos distinguir fuentes, por ahora usamos todos los tiempos
        const last5 = allTimes.slice(0, Math.min(5, allTimes.length));
        if (last5.length > 0) {
          const avg = last5.reduce((sum: number, t: any) => sum + t.time, 0) / last5.length;
          result[`${style}_avg5`] = avg;
          
          // 4. Consistency Score (desviación estándar)
          if (last5.length >= 2) {
            const mean = avg;
            const variance = last5.reduce((sum: number, t: any) => sum + Math.pow(t.time - mean, 2), 0) / last5.length;
            const stdDev = Math.sqrt(variance);
            result[`${style}_consistencyScore`] = stdDev;
            
            // Badge de consistencia
            if (stdDev < 0.5) result[`${style}_consistencyBadge`] = 'EXCELENTE';
            else if (stdDev < 1.0) result[`${style}_consistencyBadge`] = 'BUENO';
            else if (stdDev < 2.0) result[`${style}_consistencyBadge`] = 'REGULAR';
            else result[`${style}_consistencyBadge`] = 'INCONSISTENTE';
          }
        }
        
        // 5. % Mejora anual (YoY) - Comparar primer vs último tiempo del año
        if (thisYearTimes.length >= 2) {
          const sortedYear = [...thisYearTimes].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const firstTimeYear = sortedYear[0].time;
          const lastTimeYear = sortedYear[sortedYear.length - 1].time;
          const improvement = firstTimeYear - lastTimeYear; // Positivo = mejoró
          const percentImprovement = (improvement / firstTimeYear) * 100;
          result[`${style}_yearImprovement`] = improvement;
          result[`${style}_yearImprovementPercent`] = percentImprovement;
        }
        
        // 6. Ritmo de mejora mensual
        if (thisYearTimes.length >= 2) {
          const sortedYear = [...thisYearTimes].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const firstDate = new Date(sortedYear[0].date);
          const lastDate = new Date(sortedYear[sortedYear.length - 1].date);
          const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth());
          
          if (monthsDiff > 0) {
            const totalImprovement = sortedYear[0].time - sortedYear[sortedYear.length - 1].time;
            result[`${style}_monthlyImprovement`] = totalImprovement / monthsDiff;
          }
        }
      }
    });

    console.log('📊 Resultado final:', result);
    return NextResponse.json({ bestTimes: result });
  } catch (error) {
    console.error("GET /api/parent/best-times error", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
