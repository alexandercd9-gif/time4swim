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

export default function BestTimesByStyle() {
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [childId, setChildId] = useState("");
  const [source, setSource] = useState<"COMPETITION" | "TRAINING">("COMPETITION");
  const [data, setData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/swimmers", { credentials: "include" })
      .then((r) => r.json())
      .then((rows) => {
        const mapped = (rows || []).map((c: any) => ({ id: c.id, name: c.name }));
        setChildren(mapped);
        if (mapped.length > 0) setChildId(mapped[0].id);
      });
  }, []);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    const params = new URLSearchParams({ source, childId });
    fetch(`/api/parent/best-times?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setData(json.bestTimes || {}))
      .finally(() => setLoading(false));
  }, [childId, source]);

  const rows = useMemo(() => STYLES.map((s) => ({ key: s.key, label: s.label, time: data[s.key] })), [data]);

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

        <Select value={source} onValueChange={(v: any) => setSource(v)}>
          <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="COMPETITION">Competencias</SelectItem>
            <SelectItem value="TRAINING">Prácticas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-700">{r.label}</span>
            <span className={`text-sm font-semibold ${r.time != null ? 'text-gray-900' : 'text-gray-400'}`}>
              {r.time != null ? `${fmt(r.time)} (${r.time.toFixed(2)}s)` : '—'}
            </span>
          </div>
        ))}
      </div>

      {loading && <p className="text-xs text-gray-500">Cargando...</p>}
    </div>
  );
}
