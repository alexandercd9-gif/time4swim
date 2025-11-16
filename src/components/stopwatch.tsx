"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Save, Timer, Flag, Keyboard, RotateCcw, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TrainingChart from "@/components/TrainingChart";
import { Table, TableBody, TableCell, TableHead, TableHeader as ShadTableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";

// Tipos para el cronómetro
type TimerState = "stopped" | "running" | "paused";

// Estilos de natación
const swimStyles = [
  { value: "FREESTYLE", label: "Libre", icon: "/estilos/libre.png" },
  { value: "BACKSTROKE", label: "Espalda", icon: "/estilos/espalda.png" },
  { value: "BREASTSTROKE", label: "Pecho", icon: "/estilos/pecho.png" },
  { value: "BUTTERFLY", label: "Mariposa", icon: "/estilos/mariposa.png" },
  { value: "MEDLEY_RELAY", label: "4 Estilos", icon: "/estilos/4estilos.png" }
];

// Distancias comunes
const distances = [25, 50, 100, 200, 400, 800, 1500];

export function Stopwatch({ swimmers = [] }: { swimmers?: Array<{ id: string, name: string }> }) {
  const router = useRouter();
  const [time, setTime] = useState(0); // tiempo en milisegundos
  const [state, setState] = useState<TimerState>("stopped");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);

  // Datos del entrenamiento
  const [swimmer, setSwimmer] = useState("");
  const [style, setStyle] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [openChart, setOpenChart] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  
  // Mejor tiempo del nadador en el estilo/distancia seleccionados
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [loadingBestTime, setLoadingBestTime] = useState(false);

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

  // Cargar mejor tiempo cuando cambian nadador, estilo o distancia
  useEffect(() => {
    const fetchBestTime = async () => {
      if (!swimmer || !style || !distance) {
        setBestTime(null);
        return;
      }
      
      setLoadingBestTime(true);
      try {
        const params = new URLSearchParams({
          childId: swimmer,
          distance: distance
        });
        const res = await fetch(`/api/parent/best-times?${params.toString()}`);
        const data = await res.json();
        const bestTimeForStyle = data?.bestTimes?.[style] ?? null;
        setBestTime(bestTimeForStyle);
      } catch (err) {
        console.error('Error fetching best time:', err);
        setBestTime(null);
      } finally {
        setLoadingBestTime(false);
      }
    };
    
    fetchBestTime();
  }, [swimmer, style, distance]);

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

  // Auto-ocultar configuración cuando todos los campos estén llenos
  const isConfigComplete = swimmer && style && distance;
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Configuración del Entrenamiento - Colapsable */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white w-full">
        <CardHeader className="cursor-pointer" onClick={() => setIsConfigExpanded(!isConfigExpanded)}>
          <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-600" />
              Configuración del Entrenamiento
            </div>
            <button 
              className="rounded-full bg-blue-100 hover:bg-blue-200 w-8 h-8 flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfigExpanded(!isConfigExpanded);
              }}
            >
              {isConfigExpanded ? '−' : '+'}
            </button>
          </CardTitle>
        </CardHeader>
        {isConfigExpanded && (
          <CardContent className="pt-4 px-4 pb-4">
            <div className="space-y-2">
              {/* Labels */}
              <div className="grid gap-3 sm:gap-8 md:gap-12" style={{gridTemplateColumns: "2fr 1.5fr 1.3fr"}}>
                <Label htmlFor="swimmer" className="text-xs sm:text-sm font-semibold block">Nadador</Label>
                <Label htmlFor="style" className="text-xs sm:text-sm font-semibold block">Estilo</Label>
                <Label htmlFor="distance" className="text-xs sm:text-sm font-semibold block">Distancia</Label>
              </div>
              
              {/* Selects */}
              <div className="grid gap-3 sm:gap-8 md:gap-12" style={{gridTemplateColumns: "2fr 1.5fr 1.3fr"}}>
                {/* Nadador */}
                <Select value={swimmer} onValueChange={setSwimmer}>
                  <SelectTrigger className="bg-white h-9 text-sm px-1 sm:px-5 sm:h-12 sm:text-lg">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {swimmers.length === 0 ? (
                      <SelectItem value="" disabled>No hay nadadores</SelectItem>
                    ) : (
                      swimmers.map((child) => (
                        <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Estilo */}
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-white h-9 text-sm px-1 sm:px-5 sm:h-12 sm:text-lg">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {swimStyles.map((swimStyle) => (
                      <SelectItem key={swimStyle.value} value={swimStyle.value}>
                        <div className="flex items-center gap-2">
                          <Image 
                            src={swimStyle.icon} 
                            alt={swimStyle.label} 
                            width={24} 
                            height={24}
                            className="object-contain"
                          />
                          {swimStyle.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Distancia */}
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger className="bg-white h-9 text-sm px-1 sm:px-5 sm:h-12 sm:text-lg">
                    <SelectValue placeholder="Metros" />
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
            </div>

            {/* Checkbox para mostrar notas */}
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-notes"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="show-notes" className="text-sm font-medium text-gray-700 cursor-pointer">
                Agregar notas al entrenamiento
              </Label>
            </div>

            {/* Notas - Solo visible si el checkbox está activado */}
            {showNotes && (
              <div className="mt-2 space-y-2">
                <Input
                  id="notes"
                  placeholder="Observaciones del entrenamiento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white"
                />
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Cronómetro Principal */}
      <Card className="text-center border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-lg sm:text-2xl">
            <span className="flex items-center gap-2">
              <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Cronómetro
            </span>
            <Button variant="ghost" size="sm" onClick={() => setHintsOpen(!hintsOpen)} className="text-gray-600 hover:bg-white">
              <Keyboard className="h-4 w-4 mr-2" />Atajos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Mejor Tiempo - Mostrar arriba del cronómetro si está disponible */}
          {isConfigComplete && bestTime != null && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-medium text-green-700">⭐ Mejor tiempo:</span>
              {loadingBestTime ? (
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-lg font-bold text-green-700">{formatTime(bestTime * 1000)}</span>
              )}
            </div>
          )}

          {/* Display del tiempo */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold text-blue-700 tracking-wider px-3 sm:px-4 py-4 bg-white/70 rounded-2xl shadow-sm ring-1 ring-blue-200 break-all">
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
          <div className="flex justify-center gap-2 flex-wrap w-full px-2">
            {state === "running" ? (
              <Button onClick={pauseTimer} size="lg" variant="secondary" className="px-4 sm:px-6 text-sm sm:text-base">
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            ) : (
              <Button onClick={startTimer} size="lg" className="px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                <Play className="h-4 w-4 mr-2" />
                {state === "paused" ? "Continuar" : "Iniciar"}
              </Button>
            )}
            
            <Button 
              onClick={addLap} 
              size="lg" 
              variant="outline" 
              className="px-4 sm:px-6 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={state === "stopped"}
            >
              <Flag className="h-4 w-4 mr-2" />
              Vuelta
            </Button>
            
            <Button 
              onClick={resetTimer} 
              size="lg" 
              variant="outline" 
              className="px-4 sm:px-6 border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={state === "stopped" && time === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            
            <Button 
              onClick={stopTimer} 
              size="lg" 
              variant="destructive" 
              className="px-4 sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={state === "stopped"}
            >
              <Square className="h-4 w-4 mr-2" />
              Detener
            </Button>

            {/* Botón para ver gráfico en modal */}
            <Button onClick={() => {
              router.push('/parents/records');
            }} size="default" variant="outline" className="px-4 sm:px-6 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tiempos
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
          
          {/* Botón guardar entrenamiento */}
          <div className="pt-4 border-t border-blue-200">
            <Button 
              onClick={saveTraining} 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
              size="lg"
              disabled={!swimmer || !style || !distance || time === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Entrenamiento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparación en tiempo real */}
      {bestTime != null && time > 0 && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 mb-1">Comparación con mejor tiempo</p>
                <p className="text-2xl font-bold text-green-700">{formatTime(bestTime * 1000)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Tiempo actual</p>
                <p className={`text-2xl font-bold ${time < bestTime * 1000 ? 'text-green-600' : time > bestTime * 1000 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {formatTime(time)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Diferencia</p>
                <p className={`text-2xl font-bold ${time < bestTime * 1000 ? 'text-green-600' : 'text-orange-600'}`}>
                  {time < bestTime * 1000 ? '⬇️' : '⬆️'} {formatTime(Math.abs(time - bestTime * 1000))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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