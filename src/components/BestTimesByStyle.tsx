"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StyleConfig {
  key: string;
  label: string;
  icon: string;
}

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

interface BestTimesByStyleProps {
  showExpandedView?: boolean;
  compactFilters?: boolean;
  defaultSource?: string; // Nuevo prop para forzar fuente por defecto
  hideSourceFilter?: boolean; // Nuevo prop para ocultar selector de fuente
}

export default function BestTimesByStyle({ showExpandedView = false, compactFilters = false, defaultSource = "all", hideSourceFilter = false }: BestTimesByStyleProps) {
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [childId, setChildId] = useState("");
  const [distance, setDistance] = useState<string>("all");
  const [poolSize, setPoolSize] = useState<string>("SHORT_25M"); // Por defecto 25m
  const [source, setSource] = useState<string>(defaultSource); // Usar defaultSource del prop
  const [period, setPeriod] = useState<string>("all"); // Nuevo filtro de período
  const [data, setData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table"); // Vista por defecto: tabla
  const [expandedLaps, setExpandedLaps] = useState<Record<string, boolean>>({}); // Estado para controlar qué cards tienen vueltas expandidas
  const [styles, setStyles] = useState<StyleConfig[]>([]);

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
    
    // Cargar estilos desde API
    fetch('/api/config/styles')
      .then(res => res.json())
      .then(data => {
        const stylesWithIcons = data.map((s: any) => ({
          key: s.style,
          label: s.nameEs,
          icon: `/estilos/${
            s.style === 'FREESTYLE' ? 'libre.png' :
            s.style === 'BACKSTROKE' ? 'espalda.png' :
            s.style === 'BREASTSTROKE' ? 'pecho.png' :
            s.style === 'BUTTERFLY' ? 'mariposa.png' :
            s.style === 'INDIVIDUAL_MEDLEY' ? 'combinado.png' :
            'libre.png'
          }`
        }));
        setStyles(stylesWithIcons);
      })
      .catch(err => console.error('Error cargando estilos:', err));
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

  const rows = useMemo(() => styles.map((s) => {
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
  }), [data, styles]);

  return (
    <div className="space-y-4">
      {/* Filtros - diseño moderno o compacto según prop */}
      {compactFilters ? (
        // Versión compacta para dashboard - nadador y distancia sin etiquetas flotantes
        <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-xl p-3 shadow-sm border border-blue-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nadador */}
            <div className="w-full">
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger className="w-full h-11 bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 hover:shadow-md text-sm">
                  <SelectValue placeholder="Nadador" />
                </SelectTrigger>
                <SelectContent>
                  {children.length === 0 ? (
                    <SelectItem value="none" disabled>No hay nadadores</SelectItem>
                  ) : (
                    children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Distancia */}
            <div className="w-full">
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="w-full h-11 bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-md text-sm">
                  <SelectValue placeholder="Distancia" />
                </SelectTrigger>
                <SelectContent>
                  {distances.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        // Versión moderna con labels y gradientes para cronómetro
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 rounded-2xl p-3 sm:p-5 shadow-sm border border-blue-100">
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 ${hideSourceFilter ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
            {/* Nadador */}
            <div className="group relative w-full">
              <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-blue-600 shadow-sm z-10">
                👤 Nadador
              </div>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger className="w-full h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
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
            <div className="group relative w-full">
              <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-purple-600 shadow-sm z-10">
                📏 Distancia
              </div>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="w-full h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
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
            <div className="group relative w-full">
              <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-cyan-600 shadow-sm z-10">
                🏊 Piscina
              </div>
              <Select value={poolSize} onValueChange={setPoolSize}>
                <SelectTrigger className="w-full h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {poolSizes.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fuente - Solo mostrar si no está oculto */}
            {!hideSourceFilter && (
              <div className="group relative w-full">
                <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-orange-600 shadow-sm z-10">
                  🎯 Fuente
                </div>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-orange-100 hover:border-orange-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                    <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            )}

          {/* Período */}
          <div className="group relative w-full">
            <div className="absolute -top-2 left-3 px-2 bg-white rounded-full text-xs font-medium text-green-600 shadow-sm z-10">
              📅 Período
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full h-12 sm:h-14 bg-white/90 backdrop-blur-sm border-2 border-green-100 hover:border-green-300 transition-all duration-200 hover:shadow-md pt-2 group-hover:bg-white text-sm sm:text-base">
                <SelectValue placeholder="Todo" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
      )}

      {/* Toggle para cambiar entre vista de etiquetas y tabla */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <span className="text-sm text-gray-600">Vista:</span>
        <button
          onClick={() => setViewMode("cards")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            viewMode === "cards"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🏷️ Etiquetas
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
            viewMode === "table"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📋 Tabla
        </button>
      </div>

      {/* Vista de etiquetas (cards) - 3 por fila */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((r) => {
          // Calcular tiempos individuales de cada vuelta
          let avgLapTime = null;
          let totalLaps = 0;
          let individualLaps: number[] = [];
          
          if (r.lapsCount && r.lapsData && Array.isArray(r.lapsData) && r.lapsData.length > 0 && r.time != null) {
            const accumulatedLaps = r.lapsData;
            
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
          const showLaps = expandedLaps[r.key] || false;
          
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
              className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                r.time != null 
                  ? 'bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg' 
                  : 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 opacity-60'
              }`}
            >
              {/* Decoración de borde superior con gradiente */}
              {r.time != null && (
                <div className="absolute -top-0.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
              
              {/* Contenido en layout vertical */}
              <div className="flex flex-col p-4">
                {/* Imagen del estilo - más grande y centrada */}
                <div className="flex justify-center mb-3">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center p-3 ${
                    r.time != null 
                      ? 'bg-white shadow-lg border-2 border-blue-200' 
                      : 'bg-gray-200 border-2 border-gray-300'
                  }`}>
                    {styles.find(s => s.key === r.key)?.icon ? (
                      <Image 
                        src={styles.find(s => s.key === r.key)!.icon} 
                        alt={r.label}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    ) : (
                      <span className={`text-2xl font-bold ${r.time != null ? 'text-blue-600' : 'text-gray-500'}`}>
                        {r.label.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre del estilo */}
                <h3 className={`text-center text-lg font-bold mb-2 ${
                  r.time != null ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {r.label}
                </h3>

                {/* Tiempo principal */}
                <div className="text-center mb-3">
                  <span className={`text-3xl font-bold tracking-tight ${
                    r.time != null ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {r.time != null ? fmt(r.time) : '—'}
                  </span>
                  {r.distance && (
                    <div className="mt-1">
                      <span className="inline-block text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                        {r.distance}m
                      </span>
                    </div>
                  )}
                  
                  {/* Fecha y fuente del mejor tiempo */}
                  {r.time != null && (bestDate || sourceLabel) && (
                    <div className="mt-2 flex flex-col gap-1 items-center">
                      {bestDate && (
                        <span className="text-xs text-gray-600 font-medium">
                          📅 {new Date(String(bestDate)).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                      {sourceLabel && (
                        <span className="text-xs font-semibold">
                          {getSourceIcon(sourceLabel)} {
                            String(sourceLabel) === 'COMPETITION' ? 'Competencia' :
                            String(sourceLabel) === 'TRAINING' ? 'Entrenamiento' :
                            String(sourceLabel) === 'INTERNAL_COMPETITION' ? 'Comp. Interna' : ''
                          }
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Información adicional */}
                {showExpandedView && r.time != null && (
                  <div className="space-y-2 border-t pt-3">
                    {/* Vueltas y Fecha */}
                    <div className="flex items-center justify-between text-sm">
                      {totalLaps > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Vueltas:</span>
                          <span className="font-semibold text-blue-700">{totalLaps}</span>
                        </div>
                      )}
                      {bestDate && (
                        <span className="text-xs text-gray-600">
                          📅 {new Date(String(bestDate)).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Botón para ver detalle de vueltas */}
                    {totalLaps > 0 && (
                      <button
                        onClick={() => setExpandedLaps(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
                        className="w-full py-2 px-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {showLaps ? '▲ Ocultar vueltas' : '▼ Ver detalle de vueltas'}
                      </button>
                    )}

                    {/* Detalle de vueltas expandible */}
                    {showLaps && totalLaps > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 space-y-1">
                        <div className="text-xs font-semibold text-blue-700 mb-2">Tiempos por vuelta:</div>
                        {individualLaps.map((lap, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">Vuelta {idx + 1}:</span>
                            <span className="font-mono font-semibold text-blue-700">{fmtMs(lap)}</span>
                          </div>
                        ))}
                        {avgLapTime && (
                          <div className="flex justify-between text-xs pt-2 border-t border-blue-200">
                            <span className="text-gray-700 font-semibold">Promedio:</span>
                            <span className="font-mono font-bold text-blue-800">{fmtMs(avgLapTime)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        /* Vista de tabla */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Estilo</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Tiempo</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Distancia</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Fecha</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Fuente</th>
                {showExpandedView && <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Vueltas</th>}
                {showExpandedView && <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Detalle</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                let avgLapTime = null;
                let totalLaps = 0;
                let individualLaps: number[] = [];
                
                if (r.lapsCount && r.lapsData && Array.isArray(r.lapsData) && r.lapsData.length > 0 && r.time != null) {
                  const accumulatedLaps = r.lapsData;
                  
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
                const showLaps = expandedLaps[r.key] || false;

                return (
                  <>
                    <tr 
                      key={r.key}
                      className={`border-b border-gray-200 transition-colors ${
                        r.time != null 
                          ? 'hover:bg-blue-50/50' 
                          : 'opacity-60'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 ${
                            r.time != null 
                              ? 'bg-white shadow-sm border border-blue-200' 
                              : 'bg-gray-200 border border-gray-300'
                          }`}>
                            {styles.find(s => s.key === r.key)?.icon ? (
                              <Image 
                                src={styles.find(s => s.key === r.key)!.icon} 
                                alt={r.label}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            ) : (
                              <span className={`text-xs font-bold ${r.time != null ? 'text-blue-600' : 'text-gray-500'}`}>
                                {r.label.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm font-semibold ${
                            r.time != null ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {r.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-lg font-bold ${
                          r.time != null ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {r.time != null ? fmt(r.time) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.distance && (
                          <span className="inline-block text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                            {r.distance}m
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {bestDate && r.time != null && (
                          <span className="text-xs text-gray-600">
                            {new Date(String(bestDate)).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.time != null && data[`${r.key}_source`] && (
                          <span className="text-xs font-semibold">
                            {String(data[`${r.key}_source`]) === 'COMPETITION' && '🏆 Competencia'}
                            {String(data[`${r.key}_source`]) === 'TRAINING' && '🏊 Entrenamiento'}
                            {String(data[`${r.key}_source`]) === 'INTERNAL_COMPETITION' && '⏱️ Comp. Interna'}
                          </span>
                        )}
                      </td>
                      {showExpandedView && (
                        <td className="px-4 py-3 text-right">
                          {totalLaps > 0 && (
                            <span className="text-sm text-gray-600">
                              {totalLaps} {totalLaps === 1 ? 'vuelta' : 'vueltas'}
                            </span>
                          )}
                        </td>
                      )}
                      {showExpandedView && (
                        <td className="px-4 py-3 text-center">
                          {totalLaps > 0 && (
                            <button
                              onClick={() => setExpandedLaps(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
                              className="px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            >
                              {showLaps ? '▲ Ocultar' : '▼ Ver'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    
                    {/* Fila expandible con detalle de vueltas */}
                    {showExpandedView && showLaps && totalLaps > 0 && (
                      <tr key={`${r.key}-details`}>
                        <td colSpan={6} className="px-4 py-3 bg-blue-50/50">
                          <div className="max-w-2xl mx-auto">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                              <div className="text-sm font-semibold text-blue-700 mb-3">Detalle de vueltas - {r.label}</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {individualLaps.map((lap, idx) => (
                                  <div key={idx} className="flex justify-between text-sm bg-blue-50 px-3 py-2 rounded">
                                    <span className="text-gray-600">Vuelta {idx + 1}:</span>
                                    <span className="font-mono font-semibold text-blue-700">{fmtMs(lap)}</span>
                                  </div>
                                ))}
                              </div>
                              {avgLapTime && (
                                <div className="flex justify-between text-sm pt-3 mt-3 border-t border-blue-200">
                                  <span className="text-gray-700 font-semibold">Promedio por vuelta:</span>
                                  <span className="font-mono font-bold text-blue-800">{fmtMs(avgLapTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {loading && <p className="text-xs text-gray-500">Cargando...</p>}
    </div>
  );
}
