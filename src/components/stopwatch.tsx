"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Save, Timer, Flag, Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TrainingChart from "@/components/TrainingChart";
import { Table, TableBody, TableCell, TableHead, TableHeader as ShadTableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";

// Tipos para el cronómetro
type TimerState = "stopped" | "running" | "paused";

// Estilos de natación
const swimStyles = [
  { value: "FREESTYLE", label: "🏊‍♂️ Libre" },
  { value: "BACKSTROKE", label: "🏊‍♀️ Espalda" },
  { value: "BREASTSTROKE", label: "🏊 Pecho" },
  { value: "BUTTERFLY", label: "🦋 Mariposa" },
  { value: "INDIVIDUAL_MEDLEY", label: "🏆 Combinado Individual" },
  { value: "MEDLEY_RELAY", label: "👥 Combinado 4 Estilos" }
];

// Distancias comunes
const distances = [25, 50, 100, 200, 400, 800, 1500];

export function Stopwatch({ swimmers = [] }: { swimmers?: Array<{ id: string, name: string }> }) {
  const [time, setTime] = useState(0); // tiempo en milisegundos
  const [state, setState] = useState<TimerState>("stopped");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);

  // Datos del entrenamiento
  const [swimmer, setSwimmer] = useState("");
  const [style, setStyle] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [openChart, setOpenChart] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);

  // Actualizar el cronómetro cada 10ms para mayor precisión
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === "running" && startTime) {
      interval = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    }
    
    return () => clearInterval(interval);
  }, [state, startTime]);

  // Atajos de teclado: Space (start/pause), L (lap), R (reset)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return; // no capturar cuando escribe
      if (e.code === 'Space') {
        e.preventDefault();
        if (state === 'running') pauseTimer(); else startTimer();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        addLap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        resetTimer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, time, startTime]);

  // Auto-seleccionar nadador desde selección global almacenada
  useEffect(() => {
    if (!swimmer) {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
        const exists = stored && swimmers.some((s) => s.id === stored);
        if (exists) setSwimmer(stored as string);
        else if (swimmers.length > 0) setSwimmer(swimmers[0].id);
      } catch {}
    }
  }, [swimmers, swimmer]);

  // Persistir selección de nadador para reusarla en otros módulos/modales
  useEffect(() => {
    if (swimmer) {
      try { localStorage.setItem('selectedChildId', swimmer); } catch {}
    }
  }, [swimmer]);

  // Formatear tiempo en MM:SS.ss
  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // Iniciar cronómetro
  const startTimer = () => {
    if (state === "stopped") {
      setStartTime(Date.now());
      setTime(0);
      setLaps([]);
    } else if (state === "paused") {
      setStartTime(Date.now() - time);
    }
    setState("running");
  };

  // Pausar cronómetro
  const pauseTimer = () => {
    setState("paused");
  };

  // Detener cronómetro
  const stopTimer = () => {
    setState("stopped");
    setStartTime(null);
  };

  // Reiniciar cronómetro
  const resetTimer = () => {
    setState("stopped");
    setTime(0);
    setStartTime(null);
    setLaps([]);
  };

  // Registrar vuelta
  const addLap = () => {
    if (state === "running") {
      setLaps(prev => [...prev, time]);
    }
  };

  // Guardar entrenamiento
  const saveTraining = async () => {
    if (time === 0) return;
    
    const trainingData = {
      childId: swimmer,
      style,
      distance: parseInt(distance),
      time: time / 1000, // convertir a segundos
      laps: laps.length > 0 ? laps : null, // guardar vueltas si existen
      notes,
      date: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(trainingData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `¡Entrenamiento guardado!\n${result.training.style} - ${result.training.distance}m\nTiempo: ${formatTime(time)}`,
          { duration: 4000 }
        );
        
        // Emitir evento personalizado para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('trainingAdded', { 
          detail: { training: result.training } 
        }));
        
        // Limpiar formulario
        resetTimer();
        setSwimmer("");
        setStyle("");
        setDistance("");
        setNotes("");
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el entrenamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cronómetro Principal */}
      <Card className="text-center border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-2xl">
            <span className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-blue-600" />
              Cronómetro
            </span>
            <Button variant="ghost" size="sm" onClick={() => setHintsOpen(!hintsOpen)} className="text-gray-600 hover:bg-white">
              <Keyboard className="h-4 w-4 mr-2" />Atajos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Display del tiempo */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="text-6xl md:text-7xl font-mono font-bold text-blue-700 tracking-wider px-4 py-4 bg-white/70 rounded-2xl shadow-sm ring-1 ring-blue-200">
            {formatTime(time)}
            </div>
          </div>
          {hintsOpen && (
            <div className="text-xs text-gray-600">
              <span className="px-2 py-1 rounded bg-white/70 border mr-2">Espacio</span> Iniciar/Pausar
              <span className="px-2 py-1 rounded bg-white/70 border mx-2">L</span> Vuelta
              <span className="px-2 py-1 rounded bg-white/70 border mx-2">R</span> Reiniciar
            </div>
          )}
          
          {/* Controles principales */}
          <div className="flex justify-center gap-2 flex-wrap">
            {state === "running" ? (
              <Button onClick={pauseTimer} size="lg" variant="secondary" className="px-6">
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            ) : (
              <Button onClick={startTimer} size="lg" className="px-6 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                {state === "paused" ? "Continuar" : "Iniciar"}
              </Button>
            )}
            
            <Button onClick={stopTimer} size="lg" variant="destructive" className="px-6">
              <Square className="h-4 w-4 mr-2" />
              Detener
            </Button>
            
            {state === "running" && (
              <Button onClick={addLap} size="lg" variant="outline" className="px-6">
                <Flag className="h-4 w-4 mr-2" />Vuelta
              </Button>
            )}

            {/* Botón para ver gráfico en modal */}
            <Button onClick={() => {
              // Asegurar que haya un nadador seleccionado antes de abrir el modal
              if (!swimmer && swimmers.length > 0) {
                const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
                const exists = stored && swimmers.some((s) => s.id === stored);
                setSwimmer(exists ? (stored as string) : swimmers[0].id);
              }
              setOpenChart(true);
            }} size="default" variant="outline" className="px-6">
              Tiempo de entrenamiento
            </Button>
          </div>

          {/* Vueltas */}
          {laps.length > 0 && (
            <div className="mt-4 text-left">
              <h3 className="font-semibold mb-2 text-sm">Vueltas registradas</h3>
              <div className="max-h-56 overflow-auto rounded-lg bg-white/70 ring-1 ring-gray-200">
                <Table>
                  <ShadTableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Tiempo</TableHead>
                      <TableHead>Δ respecto anterior</TableHead>
                      <TableHead>Split total</TableHead>
                    </TableRow>
                  </ShadTableHeader>
                  <TableBody>
                    {laps.map((lapTime, index) => {
                      const prev = index > 0 ? laps[index - 1] : 0;
                      const delta = index > 0 ? lapTime - prev : lapTime;
                      return (
                        <TableRow key={index}>
                          <TableCell className="w-12">{index + 1}</TableCell>
                          <TableCell>{formatTime(lapTime)}</TableCell>
                          <TableCell className="text-blue-700">{formatTime(delta)}</TableCell>
                          <TableCell className="text-gray-600">{formatTime(lapTime)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Entrenamiento */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Guardar Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nadador */}
            <div className="space-y-2">
              <Label htmlFor="swimmer">Nadador</Label>
              <Select value={swimmer} onValueChange={setSwimmer}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nadador" />
                </SelectTrigger>
                <SelectContent>
                  {swimmers.length === 0 ? (
                    <SelectItem value="" disabled>No hay nadadores registrados</SelectItem>
                  ) : (
                    swimmers.map((child) => (
                      <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Estilo */}
            <div className="space-y-2">
              <Label htmlFor="style">Estilo</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  {swimStyles.map((swimStyle) => (
                    <SelectItem key={swimStyle.value} value={swimStyle.value}>
                      {swimStyle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distancia */}
            <div className="space-y-2">
              <Label htmlFor="distance">Distancia (metros)</Label>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar distancia" />
                </SelectTrigger>
                <SelectContent>
                  {distances.map((dist) => (
                    <SelectItem key={dist} value={dist.toString()}>
                      {dist}m
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                placeholder="Observaciones del entrenamiento"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Botón guardar */}
          <Button 
            onClick={saveTraining} 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
            size="default"
            disabled={!swimmer || !style || !distance || time === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Entrenamiento
          </Button>
        </CardContent>
      </Card>

      {/* Modal con gráfico de tiempos */}
      <Dialog open={openChart} onOpenChange={setOpenChart}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Historial de tiempos</DialogTitle>
          </DialogHeader>
          {swimmer ? (
            <TrainingChart childId={swimmer} />
          ) : (
            <p className="text-sm text-gray-500">Selecciona un nadador para ver el gráfico.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}