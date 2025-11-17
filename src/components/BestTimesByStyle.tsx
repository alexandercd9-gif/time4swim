"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STYLES: { key: string; label: string; icon: string }[] = [
  { key: "FREESTYLE", label: "Libre", icon: "/estilos/libre.png" },
  { key: "BACKSTROKE", label: "Espalda", icon: "/estilos/espalda.png" },
  { key: "BREASTSTROKE", label: "Pecho", icon: "/estilos/pecho.png" },
  { key: "BUTTERFLY", label: "Mariposa", icon: "/estilos/mariposa.png" },
  { key: "INDIVIDUAL_MEDLEY", label: "Combinado", icon: "/estilos/4estilos.png" },
  { key: "MEDLEY_RELAY", label: "Combinado 4", icon: "/estilos/4estilos.png" },
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
  const [poolSize, setPoolSize] = useState<string>("SHORT_25M"); // Por defecto 25m
  const [source, setSource] = useState<string>("all"); // Nuevo filtro
  const [period, setPeriod] = useState<string>("all"); // Nuevo filtro de período
  const [data, setData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedView, setExpandedView] = useState(false);

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

  const poolSizes = [
    { value: "all", label: "Todas las piscinas" },
    { value: "SHORT_25M", label: "Piscina 25m" },
    { value: "LONG_50M", label: "Piscina 50m" },
  ];

  const sources = [
    { value: "all", label: "Todas las fuentes" },
    { value: "TRAINING", label: "🏊 Entrenamientos" },
    { value: "COMPETITION", label: "🏆 Competencias" },
    { value: "INTERNAL_COMPETITION", label: "⏱️ Comp. Internas" },
  ];

  const periods = [
    { value: "all", label: "Todo el tiempo" },
    { value: "7", label: "Últimos 7 días" },
    { value: "30", label: "Últimos 30 días" },
    { value: "90", label: "Últimos 3 meses" },
    { value: "180", label: "Últimos 6 meses" },
    { value: "365", label: "Último año" },
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
    const params = new URLSearchParams({ childId });
    if (source !== "all") params.set("source", source);
    if (distance !== "all") params.set("distance", distance);
    if (poolSize !== "all") params.set("poolType", poolSize);
    // Note: period filter would need backend support
    fetch(`/api/parent/best-times?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setData(json.bestTimes || {}))
      .finally(() => setLoading(false));
  }, [childId, distance, poolSize, source, period, refreshTrigger]);

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
      {/* Filtros con diseño moderno tipo card - Responsive: móvil 2 cols/3 filas, tablet/web 3 cols/2 filas */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 rounded-2xl p-3 sm:p-5 shadow-sm border border-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Nadador */}
          <div className="group relative">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-blue-600 shadow-sm z-10">
              👤 Nadador
            </div>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger className="h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distancia */}
          <div className="group relative">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-purple-600 shadow-sm z-10">
              📏 Distancia
            </div>
            <Select value={distance} onValueChange={setDistance}>
              <SelectTrigger className="h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {distances.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Piscina */}
          <div className="group relative">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-cyan-600 shadow-sm z-10">
              🏊 Piscina
            </div>
            <Select value={poolSize} onValueChange={setPoolSize}>
              <SelectTrigger className="h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {poolSizes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuente */}
          <div className="group relative">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-orange-600 shadow-sm z-10">
              🎯 Fuente
            </div>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-orange-100 hover:border-orange-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className="group relative">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-green-600 shadow-sm z-10">
              📅 Período
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-green-100 hover:border-green-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Todo" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vista Toggle */}
          <div className="group relative">
            <button
              onClick={() => setExpandedView(!expandedView)}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="text-base sm:text-lg">{expandedView ? '📊' : '👁️'}</span>
              <span className="text-sm sm:text-base">{expandedView ? 'Vista Compacta' : 'Vista Detallada'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de mejores tiempos con diseño moderno */}
      <div className="grid grid-cols-1 gap-3">
        {rows.map((r) => {
          // Calcular tiempos individuales de cada vuelta
          let avgLapTime = null;
          let totalLaps = 0;
          
          if (r.lapsCount && r.lapsData && Array.isArray(r.lapsData) && r.lapsData.length > 0 && r.time != null) {
            const accumulatedLaps = r.lapsData;
            const individualLaps: number[] = [];
            
            for (let i = 0; i < accumulatedLaps.length; i++) {
              if (i === 0) {
                individualLaps.push(accumulatedLaps[i]);
              } else {
                individualLaps.push(accumulatedLaps[i] - accumulatedLaps[i - 1]);
              }
            }
            
            const lastAccumulated = accumulatedLaps[accumulatedLaps.length - 1];
            const finalLap = (r.time * 1000) - lastAccumulated;
            individualLaps.push(finalLap);
            
            totalLaps = individualLaps.length;
            avgLapTime = (r.time * 1000) / totalLaps;
          }

          const bestDate = data[`${r.key}_bestDate`];
          const sourceLabel = data[`${r.key}_source`];
          
          // Mapear fuente a emoji
          const getSourceIcon = (src: any) => {
            const srcStr = String(src);
            if (srcStr === 'COMPETITION') return '🏆';
            if (srcStr === 'TRAINING') return '🏊';
            if (srcStr === 'INTERNAL_COMPETITION') return '⏱️';
            return '';
          };

          return (
            <div 
              key={r.key} 
              className={`group relative rounded-xl px-3 sm:px-4 py-3 transition-all duration-300 overflow-hidden ${
                r.time != null 
                  ? 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]' 
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 opacity-60'
              }`}
            >
              {/* Decoración de borde superior con gradiente */}
              {r.time != null && (
                <div className="absolute -top-0.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Icono del estilo desde public/estilos con fondo blanco */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center p-1.5 ${
                    r.time != null 
                      ? 'bg-white shadow-md border-2 border-blue-200' 
                      : 'bg-gray-200 border-2 border-gray-300'
                  }`}>
                    {STYLES.find(s => s.key === r.key)?.icon ? (
                      <Image 
                        src={STYLES.find(s => s.key === r.key)!.icon} 
                        alt={r.label}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    ) : (
                      <span className={`text-sm font-bold ${r.time != null ? 'text-blue-600' : 'text-gray-500'}`}>
                        {r.label.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm sm:text-base font-semibold ${
                    r.time != null ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {r.label}
                  </span>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
                      r.time != null ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {r.time != null ? fmt(r.time) : '—'}
                    </span>
                    {r.distance && (
                      <span className="text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                        {r.distance}m
                      </span>
                    )}
                  </div>
                  
                  {expandedView && (totalLaps > 0 || bestDate) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {totalLaps > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {totalLaps} {totalLaps === 1 ? 'vuelta' : 'vueltas'}
                          <span className="hidden sm:inline">{avgLapTime && ` • ${fmtMs(avgLapTime)}`}</span>
                        </span>
                      )}
                      {bestDate && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          📅 {new Date(String(bestDate)).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && <p className="text-xs text-gray-500">Cargando...</p>}
    </div>
  );
}
