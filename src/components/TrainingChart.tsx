"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Training = { id: string; date: string; time: number; distance: number; style: string };

const STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: "FREESTYLE", label: "Libre" },
  { value: "BACKSTROKE", label: "Espalda" },
  { value: "BREASTSTROKE", label: "Pecho" },
  { value: "BUTTERFLY", label: "Mariposa" },
  { value: "INDIVIDUAL_MEDLEY", label: "Combinado" },
  { value: "MEDLEY_RELAY", label: "Combinado 4" },
];

export default function TrainingChart({ childId }: { childId: string }) {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState<number>(now.getFullYear());
  const [style, setStyle] = useState<string>("ALL");
  const [allData, setAllData] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) return;
      setLoading(true);
      try {
        // Obtener todos los entrenamientos del mes/año para el niño; el filtro de estilo se aplica en el cliente
        const params = new URLSearchParams({ childId, month: String(month), year: String(year) });
        const res = await fetch(`/api/trainings?${params.toString()}`, { credentials: 'include' });
        const json = await res.json();
        setAllData(json.trainings || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [childId, month, year]);

  const points = useMemo(() => {
    const filtered = style === "ALL" ? allData : allData.filter((t) => t.style === style);
    const sorted = [...filtered].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    return sorted.map((t) => ({ x: new Date(t.date).getDate(), y: t.time }));
  }, [allData, style]);

  const best = useMemo(() => {
    if (!points.length) return null;
    return points.reduce((min, p) => (p.y < min.y ? p : min), points[0]);
  }, [points]);

  // Simple responsive SVG line chart
  const { path, circles } = useMemo(() => {
    if (!points.length) return { path: "", circles: [] as ReactElement[] };
    const padding = 20;
    const width = 700; // viewBox width
    const height = 240; // viewBox height
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);
    // Añadir padding vertical para evitar que un solo punto quede abajo
    const rawRangeY = rawMaxY - rawMinY;
    const yPad = Math.max(0.5, rawRangeY * 0.1); // al menos 0.5s de margen
    const minY = rawMinY - yPad;
    const maxY = rawMaxY + yPad;
    const xScale = (x: number) => {
      const domain = maxX - minX || 1;
      return padding + ((x - minX) / domain) * (width - padding * 2);
    };
    const yScale = (y: number) => {
      const domain = maxY - minY || 1;
      // invert axis so lower times are más abajo visualmente
      return height - padding - ((y - minY) / domain) * (height - padding * 2);
    };
    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.y)}`)
      .join(" ");
    const circles = points.map((p, i) => {
      const isBest = best && p.x === best.x && p.y === best.y;
      const label = isBest ? (
        <text
          key={"label" + i}
          x={xScale(p.x)}
          y={yScale(p.y) - 12}
          textAnchor="middle"
          fontSize={16}
          fontWeight="bold"
          fill="#dc2626"
        >
          {formatTime(p.y)}
        </text>
      ) : null;
      return [
        label,
        <circle
          key={i}
          cx={xScale(p.x)}
          cy={yScale(p.y)}
          r={isBest ? 4.5 : 3}
          fill={isBest ? "#16a34a" : "#2563eb"}
          stroke={isBest ? "#065f46" : "white"}
          strokeWidth={isBest ? 2 : 1}
        />
      ];
    }).flat();
    return { path: d, circles };
  }, [points, best]);

  // Resumen por estilo: mejor tiempo del período actual
  const bestByStyle = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allData) {
      const current = map.get(t.style);
      if (current == null || t.time < current) map.set(t.style, t.time);
    }
    return STYLE_OPTIONS.map((opt) => ({
      style: opt.label,
      key: opt.value,
      time: map.get(opt.value) ?? null,
    }));
  }, [allData]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const centi = Math.round((secs - Math.floor(secs)) * 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={String(m)}>
                {new Date(0, m - 1).toLocaleString("es", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={style} onValueChange={setStyle}>
          <SelectTrigger><SelectValue placeholder="Estilo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estilos</SelectItem>
            <SelectItem value="FREESTYLE">Libre</SelectItem>
            <SelectItem value="BACKSTROKE">Espalda</SelectItem>
            <SelectItem value="BREASTSTROKE">Pecho</SelectItem>
            <SelectItem value="BUTTERFLY">Mariposa</SelectItem>
            <SelectItem value="INDIVIDUAL_MEDLEY">Combinado</SelectItem>
            <SelectItem value="MEDLEY_RELAY">Combinado 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 700 240" className="w-full h-56">
          {/* axes */}
          <line x1="20" y1="220" x2="680" y2="220" stroke="#e5e7eb" />
          <line x1="20" y1="20" x2="20" y2="220" stroke="#e5e7eb" />
          {/* line */}
          {points.length > 0 ? (
            <>
              <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" />
              {circles}
            </>
          ) : (
            <text x="350" y="120" textAnchor="middle" className="fill-gray-400 text-sm">Sin datos para el período</text>
          )}
        </svg>
      </div>

      {/* Resumen */}
      {best && (
        <p className="text-sm text-gray-600">Mejor tiempo del período: <span className="font-semibold text-green-700">{best.y.toFixed(2)}s</span></p>
      )}

      {loading && <p className="text-sm text-gray-500">Cargando datos...</p>}

      {/* Mejor tiempo por estilo */}
      <div className="pt-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Mejor tiempo por estilo</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {bestByStyle.map((row) => (
            <div key={row.key} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
              <span className="text-sm text-gray-700">{row.style}</span>
              <span className={`text-sm font-medium ${row.time ? 'text-gray-900' : 'text-gray-400'}`}>
                {row.time == null ? '—' : `${formatTime(row.time)} (${row.time.toFixed(2)}s)`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
