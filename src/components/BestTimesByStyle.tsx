"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STYLES: { key: string; label: string }[] = [
  { key: "FREESTYLE", label: "Libre" },
  { key: "BACKSTROKE", label: "Espalda" },
  { key: "BREASTSTROKE", label: "Pecho" },
  { key: "BUTTERFLY", label: "Mariposa" },
  { key: "INDIVIDUAL_MEDLEY", label: "Combinado" },
  { key: "MEDLEY_RELAY", label: "Combinado 4" },
];

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const c = Math.round((secs - Math.floor(secs)) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}

function fmtMs(ms: number) {
  const secs = ms / 1000;
  return fmt(secs);
}

export default function BestTimesByStyle() {
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [childId, setChildId] = useState("");
  const [distance, setDistance] = useState<string>("all");
  const [data, setData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const distances = [
    { value: "all", label: "Todas las distancias" },
    { value: "25", label: "25m" },
    { value: "50", label: "50m" },
    { value: "100", label: "100m" },
    { value: "200", label: "200m" },
    { value: "400", label: "400m" },
    { value: "800", label: "800m" },
    { value: "1500", label: "1500m" },
  ];

  useEffect(() => {
    fetch("/api/swimmers", { credentials: "include" })
      .then((r) => r.json())
      .then((rows) => {
        const mapped: Array<{ id: string; name: string }> = (rows || []).map((c: any) => ({ id: c.id, name: c.name }));
        setChildren(mapped);
        if (mapped.length > 0) {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
          const exists = stored && mapped.some((m: { id: string; name: string }) => m.id === stored);
          setChildId(exists ? (stored as string) : mapped[0].id);
        }
      });
  }, []);

  // Persist selected child globally so other pages/dialogs can reuse it
  useEffect(() => {
    if (childId) {
      try { localStorage.setItem('selectedChildId', childId); } catch {}
    }
  }, [childId]);

  // Escuchar evento de nuevo entrenamiento guardado
  useEffect(() => {
    const handleTrainingAdded = (event: any) => {
      // Refrescar datos cuando se agrega un nuevo entrenamiento
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('trainingAdded', handleTrainingAdded);
    return () => window.removeEventListener('trainingAdded', handleTrainingAdded);
  }, []);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    const params = new URLSearchParams({ source: "TRAINING", childId });
    if (distance !== "all") params.set("distance", distance);
    fetch(`/api/parent/best-times?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setData(json.bestTimes || {}))
      .finally(() => setLoading(false));
  }, [childId, distance, refreshTrigger]);

  const rows = useMemo(() => STYLES.map((s) => {
    const time = data[s.key];
    const lapsCount = data[`${s.key}_laps`];
    const lapsData = data[`${s.key}_lapsData`];
    const distance = data[`${s.key}_distance`];
    return { 
      key: s.key, 
      label: s.label, 
      time, 
      lapsCount, 
      lapsData,
      distance
    };
  }), [data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select value={childId} onValueChange={setChildId}>
          <SelectTrigger><SelectValue placeholder="Selecciona un nadador" /></SelectTrigger>
          <SelectContent>
            {children.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={distance} onValueChange={setDistance}>
          <SelectTrigger><SelectValue placeholder="Distancia" /></SelectTrigger>
          <SelectContent>
            {distances.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {rows.map((r) => {
          // Calcular tiempos individuales de cada vuelta
          let avgLapTime = null;
          let totalLaps = 0;
          
          if (r.lapsCount && r.lapsData && Array.isArray(r.lapsData) && r.lapsData.length > 0 && r.time != null) {
            // Los laps guardados son tiempos ACUMULADOS
            // Convertir a tiempos individuales
            const accumulatedLaps = r.lapsData;
            const individualLaps: number[] = [];
            
            for (let i = 0; i < accumulatedLaps.length; i++) {
              if (i === 0) {
                individualLaps.push(accumulatedLaps[i]);
              } else {
                individualLaps.push(accumulatedLaps[i] - accumulatedLaps[i - 1]);
              }
            }
            
            // Agregar vuelta final
            const lastAccumulated = accumulatedLaps[accumulatedLaps.length - 1];
            const finalLap = (r.time * 1000) - lastAccumulated;
            individualLaps.push(finalLap);
            
            // Total de vueltas
            totalLaps = individualLaps.length;
            
            // Promedio usando el tiempo total
            avgLapTime = (r.time * 1000) / totalLaps;
          }

          return (
            <div key={r.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-700">{r.label}</span>
              <div className="flex flex-col items-end gap-0.5">
                <span className={`text-sm font-semibold ${r.time != null ? 'text-gray-900' : 'text-gray-400'}`}>
                  {r.time != null ? fmt(r.time) : '—'}
                  {r.distance && <span className="text-xs text-gray-500 ml-1">({r.distance}m)</span>}
                </span>
                {totalLaps > 0 && (
                  <span className="text-xs text-blue-600">
                    {totalLaps} {totalLaps === 1 ? 'vuelta' : 'vueltas'}
                    {avgLapTime && ` • Promedio: ${fmtMs(avgLapTime)}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && <p className="text-xs text-gray-500">Cargando...</p>}
    </div>
  );
}
