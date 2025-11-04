"use client";

import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useSidebar } from "@/hooks/use-sidebar";

type Training = { id: string; date: string; time: number; distance: number; style: string };

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "FREESTYLE", label: "Libre" },
  { value: "BACKSTROKE", label: "Espalda" },
  { value: "BREASTSTROKE", label: "Pecho" },
  { value: "BUTTERFLY", label: "Mariposa" },
  { value: "INDIVIDUAL_MEDLEY", label: "Combinado" },
  { value: "MEDLEY_RELAY", label: "Combinado 4" },
];

type ViewMode = "year" | "month" | "day";

interface TrainingChartProps {
  childId?: string;
}

export default function TrainingChart({ childId: propChildId }: TrainingChartProps = {}) {
  const now = new Date();
  const { isSidebarCollapsed } = useSidebar();
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedChildId, setSelectedChildId] = useState(propChildId || "");
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [style, setStyle] = useState<string>("ALL");
  const [distance, setDistance] = useState<string>("25");
  const [allData, setAllData] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string } | null>(null);

  const DISTANCE_OPTIONS = [
    { value: "25", label: "25m" },
    { value: "50", label: "50m" },
    { value: "100", label: "100m" },
    { value: "200", label: "200m" },
    { value: "400", label: "400m" },
    { value: "800", label: "800m" },
  ];

  // Función formatTime debe estar antes de useMemo
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const centi = Math.round((secs - Math.floor(secs)) * 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
  };

  // Cargar lista de hijos
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/swimmers", { credentials: "include" });
        const json = await res.json();
        const kids = (json || []).map((c: any) => ({ id: c.id, name: c.name }));
        setChildren(kids);
        // Si propChildId existe, usar ese; sino usar localStorage o auto-seleccionar
        if (propChildId) {
          setSelectedChildId(propChildId);
        } else {
          const saved = localStorage.getItem("selectedChildId");
          if (saved && kids.some((k: any) => k.id === saved)) {
            setSelectedChildId(saved);
          } else if (kids.length > 0) {
            setSelectedChildId(kids[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading children:", err);
      }
    };
    load();
  }, []);

  // Guardar selección en localStorage
  useEffect(() => {
    if (selectedChildId) {
      localStorage.setItem("selectedChildId", selectedChildId);
    }
  }, [selectedChildId]);

  // Cargar datos según vista
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChildId) return;
      setLoading(true);
      try {
        let params;
        if (viewMode === "year") {
          // Para vista anual, obtener todos los datos del año
          params = new URLSearchParams({ childId: selectedChildId, year: String(year) });
        } else {
          // Para vista mensual o diaria, obtener datos del mes
          params = new URLSearchParams({ childId: selectedChildId, month: String(month), year: String(year) });
        }
        const res = await fetch(`/api/trainings?${params.toString()}`, { credentials: 'include' });
        const json = await res.json();
        setAllData(json.trainings || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedChildId, month, year, viewMode]);

  // Procesar datos según el modo de vista
  const points = useMemo(() => {
    let filtered = style === "ALL" ? allData : allData.filter((t) => t.style === style);
    if (distance !== "ALL") {
      filtered = filtered.filter((t) => t.distance === parseInt(distance));
    }

    if (viewMode === "year") {
      // Vista anual: agrupar por mes y obtener mejor tiempo de cada mes
      const monthlyBest = new Map<number, { time: number; count: number }>();
      
      filtered.forEach((t) => {
        const d = new Date(t.date);
        const m = d.getMonth() + 1; // 1-12
        const existing = monthlyBest.get(m);
        if (!existing || t.time < existing.time) {
          monthlyBest.set(m, { time: t.time, count: (existing?.count || 0) + 1 });
        }
      });

      return Array.from(monthlyBest.entries())
        .map(([month, data]) => ({
          x: month,
          y: data.time,
          label: new Date(year, month - 1).toLocaleString('es', { month: 'short' }).toUpperCase(),
          detail: `${formatTime(data.time)} (${data.count} entreno${data.count > 1 ? 's' : ''})`
        }))
        .sort((a, b) => a.x - b.x);
        
    } else if (viewMode === "month") {
      // Vista mensual: agrupar por semana
      const weeklyBest = new Map<number, { time: number; count: number }>();
      
      filtered.forEach((t) => {
        const d = new Date(t.date);
        if (d.getMonth() + 1 !== month) return;
        
        // Calcular número de semana del mes (1-5)
        const dayOfMonth = d.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        
        const existing = weeklyBest.get(weekNum);
        if (!existing || t.time < existing.time) {
          weeklyBest.set(weekNum, { time: t.time, count: (existing?.count || 0) + 1 });
        }
      });

      return Array.from(weeklyBest.entries())
        .map(([week, data]) => ({
          x: week,
          y: data.time,
          label: `S${week}`,
          detail: `${formatTime(data.time)} (${data.count} entreno${data.count > 1 ? 's' : ''})`
        }))
        .sort((a, b) => a.x - b.x);
        
    } else {
      // Vista diaria: todos los entrenamientos día por día
      const sorted = [...filtered].sort((a, b) => +new Date(a.date) - +new Date(b.date));
      return sorted.map((t) => {
        const d = new Date(t.date);
        return {
          x: d.getDate(),
          y: t.time,
          label: `${d.getDate()}`,
          detail: `${formatTime(t.time)} - ${STYLE_OPTIONS.find(s => s.value === t.style)?.label || t.style} ${t.distance}m`
        };
      });
    }
  }, [allData, style, distance, viewMode, month, year]);

  const best = useMemo(() => {
    if (!points.length) return null;
    return points.reduce((min, p) => (p.y < min.y ? p : min), points[0]);
  }, [points]);

  // Renderizado moderno del gráfico SVG
  const renderChart = () => {
    if (!points.length) {
      return (
        <div className="flex items-center justify-center h-80 text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium">Sin datos para mostrar</p>
            <p className="text-sm">Ajusta los filtros para ver entrenamientos</p>
          </div>
        </div>
      );
    }

    const padding = { top: 30, right: 40, bottom: 40, left: 60 };
    const width = 800;
    const height = 400;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);
    
    const rawRangeY = rawMaxY - rawMinY;
    const yPad = Math.max(1, rawRangeY * 0.15);
    const minY = rawMinY - yPad;
    const maxY = rawMaxY + yPad;

    const xScale = (x: number) => {
      const domain = maxX - minX || 1;
      return padding.left + ((x - minX) / domain) * chartWidth;
    };

    const yScale = (y: number) => {
      const domain = maxY - minY || 1;
      return height - padding.bottom - ((y - minY) / domain) * chartHeight;
    };

    // Grid lines
    const gridLines = [];
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = minY + (maxY - minY) * (i / ySteps);
      const yPos = yScale(yVal);
      gridLines.push(
        <g key={`grid-${i}`}>
          <line
            x1={padding.left}
            y1={yPos}
            x2={width - padding.right}
            y2={yPos}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 10}
            y={yPos + 4}
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            {formatTime(yVal)}
          </text>
        </g>
      );
    }

    // Path
    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.y)}`)
      .join(" ");

    // Area gradient
    const areaPath = `${pathD} L${xScale(points[points.length - 1].x)},${height - padding.bottom} L${xScale(points[0].x)},${height - padding.bottom} Z`;

    return (
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {gridLines}

          {/* Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => {
            const isBest = best && p.x === best.x && p.y === best.y;
            const cx = xScale(p.x);
            const cy = yScale(p.y);
            
            return (
              <g key={i}>
                {isBest && (
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="8"
                      fill="#10b981"
                      opacity="0.2"
                    />
                    <text
                      x={cx}
                      y={cy - 18}
                      textAnchor="middle"
                      className="text-sm font-bold fill-green-600"
                    >
                      ⭐ {formatTime(p.y)}
                    </text>
                  </>
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isBest ? 6 : 4}
                  fill={isBest ? "#10b981" : "#3b82f6"}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-6"
                  onMouseEnter={() => setHoveredPoint({ x: cx, y: cy, label: p.detail })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X Axis labels */}
          {points.map((p, i) => {
            if (viewMode === "day" && points.length > 15 && i % 2 !== 0) return null;
            return (
              <text
                key={`xlabel-${i}`}
                x={xScale(p.x)}
                y={height - padding.bottom + 25}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {p.label}
              </text>
            );
          })}

          {/* Y Axis label */}
          <text
            x={padding.left / 2}
            y={padding.top / 2}
            textAnchor="middle"
            className="text-xs fill-gray-600 font-semibold"
          >
            Tiempo
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 10}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {hoveredPoint.label}
          </div>
        )}
      </div>
    );
  };

  // Resumen por estilo: mejor tiempo del período actual
  const bestByStyle = useMemo(() => {
    const map = new Map<string, number>();
    let dataToAnalyze = allData;
    
    // Aplicar filtro de distancia si está seleccionado
    if (distance !== "ALL") {
      dataToAnalyze = allData.filter((t) => t.distance === parseInt(distance));
    }
    
    for (const t of dataToAnalyze) {
      const current = map.get(t.style);
      if (current == null || t.time < current) map.set(t.style, t.time);
    }
    return STYLE_OPTIONS.map((opt) => ({
      style: opt.label,
      key: opt.value,
      time: map.get(opt.value) ?? null,
    }));
  }, [allData, distance]);

  return (
    <div className="space-y-4">
      {/* Botón para colapsar/expandir filtros - Solo visible en desktop */}
      <button
        onClick={() => setFiltersCollapsed(!filtersCollapsed)}
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {filtersCollapsed ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Mostrar Filtros</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Ocultar Filtros</span>
          </>
        )}
      </button>

      {/* Layout 3 Columnas con proporciones dinámicas según estado del sidebar */}
      <div className={`grid gap-4 transition-all duration-300 ${
        filtersCollapsed 
          ? 'grid-cols-1 lg:grid-cols-5' 
          : isSidebarCollapsed 
            ? 'grid-cols-1 lg:grid-cols-[20%_65%_15%]'  // Sidebar cerrado
            : 'grid-cols-1 lg:grid-cols-[25%_58%_17%]'  // Sidebar abierto (25% | 58% | 17%)
      }`} style={{ gridAutoRows: '1fr' }}>
        
        {/* Columna 1: Filtros - 25% (sidebar abierto) o 20% (sidebar cerrado) */}
        {!filtersCollapsed && (
          <div className="overflow-hidden">
            {/* Card de Filtros */}
            <Card className="p-3 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {/* Fila 1: Nadador + Año en la misma línea horizontal */}
              {children.length > 0 && (
                <div className="grid grid-cols-[1fr_90px] gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Nadador</label>
                    <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Año</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Fila 2: Vista (Año/Mes/Día) - Botones horizontales */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Vista</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setViewMode("year")}
                    className={`px-2 py-1.5 text-xs rounded-md font-medium transition-all ${
                      viewMode === "year"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Año
                  </button>
                  <button
                    onClick={() => setViewMode("month")}
                    className={`px-2 py-1.5 text-xs rounded-md font-medium transition-all ${
                      viewMode === "month"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Mes
                  </button>
                  <button
                    onClick={() => setViewMode("day")}
                    className={`px-2 py-1.5 text-xs rounded-md font-medium transition-all ${
                      viewMode === "day"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Día
                  </button>
                </div>
              </div>

              {/* Fila 3: Mes + Estilo */}
              <div className="grid grid-cols-2 gap-2">
                {/* Mes (solo visible si no es vista anual) */}
                {viewMode !== "year" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Mes</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {new Date(0, m - 1).toLocaleString("es", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div /> 
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Estilo</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-8 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      {STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fila 4: Distancia - Grid horizontal 2 columnas */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Distancia</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DISTANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDistance(opt.value)}
                      className={`px-2 py-1.5 text-xs rounded-md font-medium transition-all ${
                        distance === opt.value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicador compacto */}
              <div className="pt-2 border-t text-xs text-gray-500 text-center">
                {viewMode === "year" && `${year}`}
                {viewMode === "month" && `${new Date(year, month - 1).toLocaleString('es', { month: 'short' })} ${year}`}
                {viewMode === "day" && `${new Date(year, month - 1).toLocaleString('es', { month: 'short' })} ${year}`}
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* Columna 2: Gráfico - 60% (sidebar abierto) o 65% (sidebar cerrado) */}
        <div className={`overflow-hidden transition-all duration-300 ${
          filtersCollapsed ? 'lg:col-span-4' : ''
        }`}>
          <div className="border border-gray-200 rounded-lg bg-transparent flex flex-col h-full overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center space-y-3">
                  <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-gray-500">Cargando gráfico...</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                {renderChart()}
              </div>
            )}
          </div>
        </div>

        {/* Columna 3: Estadísticas - 15% (misma altura que las demás) */}
        <div className={`overflow-hidden ${
          filtersCollapsed ? 'lg:col-span-1' : ''
        }`}>
          <Card className="p-3 h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-2.5">
            {/* Mejor tiempo del período - Compacto pero visible */}
            {best && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wide mb-1">Mejor Tiempo</p>
                  <p className="text-2xl font-bold text-green-700">{formatTime(best.y)}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{best.detail}</p>
                </div>
                {/* Contenedor para la copa sin fondo, ligeramente desplazada a la izquierda */}
                <div className="flex-shrink-0 flex items-center justify-center -ml-3">
                  <span className="text-[2rem] leading-none">🏆</span>
                </div>
              </div>
            </div>
          )}

          {/* Tiempos por Estilo */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <span>📊</span>
              Tiempos por Estilo
            </h4>
            {/* Distribuir los 6 estilos en filas iguales: grid con 6 filas y ocupar el espacio restante */}
            <div className="mt-1 grid grid-rows-6 gap-2 flex-1">
              {bestByStyle.map((row) => (
                <div 
                  key={row.key} 
                  className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-md px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 transition-colors h-full"
                >
                  <span className="text-[11px] font-medium text-gray-600">{row.style}</span>
                  <span className={`text-[11px] font-bold ${row.time ? 'text-blue-600' : 'text-gray-400'}`}>
                    {row.time == null ? '—' : formatTime(row.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                <p className="text-xs text-blue-600">Cargando datos...</p>
              </div>
            </div>
          )}
          </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
