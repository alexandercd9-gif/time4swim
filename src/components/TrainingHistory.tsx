"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const STYLES: Record<string, string> = {
  FREESTYLE: "Libre",
  BACKSTROKE: "Espalda",
  BREASTSTROKE: "Pecho",
  BUTTERFLY: "Mariposa",
  INDIVIDUAL_MEDLEY: "Combinado",
  MEDLEY_RELAY: "Combinado 4",
};

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const c = Math.round((secs - Math.floor(secs)) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}

function fmtMs(ms: number) {
  return fmt(ms / 1000);
}

interface Training {
  id: string;
  style: string;
  distance: number;
  time: number;
  date: string;
  laps?: number[];
}

export default function TrainingHistory() {
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [childId, setChildId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedDate, setSelectedDate] = useState("");
  const [trainingsByDate, setTrainingsByDate] = useState<Record<string, Training[]>>({});
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Generar años disponibles (últimos 3 años + actual)
  const years = Array.from({ length: 4 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y.toString(), label: y.toString() };
  });

  // Meses del año
  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  // Cargar nadadores
  useEffect(() => {
    fetch("/api/swimmers", { credentials: "include" })
      .then((r) => r.json())
      .then((rows) => {
        const mapped: Array<{ id: string; name: string }> = (rows || []).map((c: any) => ({ 
          id: c.id, 
          name: c.name 
        }));
        setChildren(mapped);
        if (mapped.length > 0) {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
          const exists = stored && mapped.some((m) => m.id === stored);
          setChildId(exists ? (stored as string) : mapped[0].id);
        }
      });
  }, []);

  // Sincronizar childId con localStorage
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

  // Cargar entrenamientos del mes seleccionado
  useEffect(() => {
    if (!childId || !year || !month) return;
    
    setLoading(true);
    const params = new URLSearchParams({
      childId,
      year,
      month,
    });

    fetch(`/api/parent/training-history?${params.toString()}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        const grouped: Record<string, Training[]> = {};
        (json.trainings || []).forEach((t: Training) => {
          const dateKey = t.date.split('T')[0]; // YYYY-MM-DD
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(t);
        });
        setTrainingsByDate(grouped);
        
        // Auto-seleccionar el día más reciente si existe
        const dates = Object.keys(grouped).sort().reverse();
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [childId, year, month, refreshTrigger]);

  // Obtener lista de fechas con entrenamientos
  const datesWithTrainings = Object.keys(trainingsByDate).sort().reverse();
  
  // Entrenamientos del día seleccionado
  const selectedTrainings = selectedDate ? trainingsByDate[selectedDate] || [] : [];

  // Formatear fecha para mostrar
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); // Agregar tiempo para evitar timezone issues
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Formatear día corto para botones
  const formatDayButton = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
    const day = date.getDate();
    return { weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1), day };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Historial de Entrenamientos</h3>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={childId} onValueChange={setChildId}>
          <SelectTrigger><SelectValue placeholder="Selecciona un nadador" /></SelectTrigger>
          <SelectContent>
            {children.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando entrenamientos...</p>}

      {!loading && datesWithTrainings.length === 0 && (
        <Card className="p-6 text-center text-gray-500">
          No hay entrenamientos registrados en este mes
        </Card>
      )}

      {!loading && datesWithTrainings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Lista de días con entrenamientos */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Días con entrenamientos</h4>
              <div className="space-y-2">
                {datesWithTrainings.map((date) => {
                  const { weekday, day } = formatDayButton(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                        selectedDate === date
                          ? 'bg-blue-100 text-blue-900 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">{weekday}</span>
                        <span className="text-lg font-bold">{day}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {trainingsByDate[date].length} {trainingsByDate[date].length === 1 ? 'entrenamiento' : 'entrenamientos'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Detalle de entrenamientos del día */}
          <div className="lg:col-span-2">
            {selectedDate && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {formatDate(selectedDate)}
                </h4>
                
                <div className="space-y-3">
                  {selectedTrainings.map((training, idx) => {
                    const hasLaps = training.laps && training.laps.length > 0;
                    
                    // Calcular tiempos individuales de cada vuelta
                    let individualLaps: number[] = [];
                    let avgLapTime = null;
                    
                    if (hasLaps) {
                      // Los laps guardados son tiempos ACUMULADOS
                      // Necesitamos convertirlos a tiempos individuales
                      const accumulatedLaps = training.laps!;
                      
                      for (let i = 0; i < accumulatedLaps.length; i++) {
                        if (i === 0) {
                          // Primera vuelta = tiempo acumulado directo
                          individualLaps.push(accumulatedLaps[i]);
                        } else {
                          // Vueltas siguientes = diferencia entre acumulados
                          individualLaps.push(accumulatedLaps[i] - accumulatedLaps[i - 1]);
                        }
                      }
                      
                      // Agregar vuelta final (tiempo total - último acumulado)
                      const lastAccumulated = accumulatedLaps[accumulatedLaps.length - 1];
                      const finalLap = (training.time * 1000) - lastAccumulated;
                      individualLaps.push(finalLap);
                      
                      // Promedio de todas las vueltas
                      avgLapTime = (training.time * 1000) / individualLaps.length;
                    }

                    return (
                      <div key={training.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {STYLES[training.style] || training.style}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {training.distance}m
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                              {fmt(training.time)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Intento #{idx + 1}
                            </div>
                          </div>
                        </div>

                        {hasLaps && individualLaps.length > 0 && (
                          <div className="border-t pt-2 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">
                                {individualLaps.length} {individualLaps.length === 1 ? 'Vuelta' : 'Vueltas'}
                              </span>
                              {avgLapTime && (
                                <span className="text-xs text-blue-600">
                                  Promedio: {fmtMs(avgLapTime)}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {individualLaps.map((lap, lapIdx) => {
                                // Calcular tiempo acumulado hasta esta vuelta
                                const accumulatedTime = individualLaps
                                  .slice(0, lapIdx + 1)
                                  .reduce((sum, l) => sum + l, 0);
                                
                                return (
                                  <div 
                                    key={lapIdx}
                                    className="bg-white px-2 py-1.5 rounded text-xs border border-gray-200"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-500 font-medium">V{lapIdx + 1}:</span>
                                      <span className="font-semibold text-gray-900">{fmtMs(lap)}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                      Acum: {fmtMs(accumulatedTime)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
