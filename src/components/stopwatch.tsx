"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Save, Timer, Flag, Keyboard, RotateCcw, BarChart3, Settings2, Waves, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TrainingChart from "@/components/TrainingChart";
import { Table, TableBody, TableCell, TableHead, TableHeader as ShadTableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

// Tipos para el cronómetro
type TimerState = "stopped" | "running" | "paused";

interface SwimStyle {
  value: string;
  label: string;
  icon: string;
}

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
  const [poolType, setPoolType] = useState("SHORT_25M");
  const [poolTypes, setPoolTypes] = useState<Array<{ poolSize: string; nameEs: string; nameEn: string }>>([]);
  const [swimStyles, setSwimStyles] = useState<SwimStyle[]>([]);
  
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

  // Cargar tipos de piscina y estilos desde la API
  useEffect(() => {
    const fetchPoolTypes = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.pools && Array.isArray(data.pools)) {
          setPoolTypes(data.pools);
        }
      } catch (err) {
        console.error('Error fetching pool types:', err);
      }
    };
    
    const fetchSwimStyles = async () => {
      try {
        const res = await fetch('/api/config/styles');
        const data = await res.json();
        const stylesWithIcons = data.map((s: any) => ({
          value: s.style,
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
        setSwimStyles(stylesWithIcons);
      } catch (err) {
        console.error('Error fetching swim styles:', err);
      }
    };
    
    fetchPoolTypes();
    fetchSwimStyles();
  }, []);

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

  // Auto-contraer Tipo de Piscina cuando se selecciona un estilo
  useEffect(() => {
    if (style) {
      setIsPoolTypeExpanded(false);
    }
  }, [style]);

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
      poolType,
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
  const [isPoolTypeExpanded, setIsPoolTypeExpanded] = useState(true);

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      {/* Tabs para Tipo de Piscina - Colapsable */}
      {poolTypes.length > 0 && (
        <div className="rounded-xl shadow-md border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="flex items-center gap-3 text-left px-4 py-3 cursor-pointer hover:bg-cyan-100/40 rounded-xl transition-all" onClick={() => setIsPoolTypeExpanded(!isPoolTypeExpanded)}>
            <Waves className="w-5 h-5 text-cyan-500" />
            <span className="font-semibold text-cyan-700">Tipo de Piscina</span>
            {!isPoolTypeExpanded && poolType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-cyan-300 rounded-full text-sm">
                <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-gray-700">
                  {poolTypes.find(p => p.poolSize === poolType)?.nameEs || poolType}
                </span>
              </span>
            )}
            <span className="ml-auto">
              <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-full">
                {isPoolTypeExpanded ? 'Activo' : 'Cerrado'}
              </span>
            </span>
          </div>
          {isPoolTypeExpanded && (
            <div className="rounded-lg border bg-white p-6 shadow-sm mx-4 mb-4">
              <Tabs value={poolType} onValueChange={setPoolType} className="w-full">
                <TabsList className="grid w-full h-10 bg-slate-100" style={{ gridTemplateColumns: `repeat(${poolTypes.length}, 1fr)` }}>
                  {poolTypes.map((pool) => (
                    <TabsTrigger 
                      key={pool.poolSize} 
                      value={pool.poolSize} 
                      className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md"
                    >
                      {pool.nameEs}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      )}

      {/* Configuración del Entrenamiento - Colapsable */}
      <div className="rounded-xl shadow-md border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center gap-3 text-left px-4 py-3 cursor-pointer hover:bg-blue-100/40 rounded-xl transition-all" onClick={() => setIsConfigExpanded(!isConfigExpanded)}>
          <Settings2 className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-blue-700">Configuración del Entrenamiento</span>
          {!isConfigExpanded && (swimmer || style || distance) && (
            <div className="flex items-center gap-2 ml-2 flex-wrap">
              {swimmer && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-700">
                    {swimmers.find(s => s.id === swimmer)?.name || 'Nadador'}
                  </span>
                </span>
              )}
              {style && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <Image 
                    src={swimStyles.find(s => s.value === style)?.icon || '/estilos/libre.png'} 
                    alt="estilo" 
                    width={14} 
                    height={14}
                    className="object-contain"
                  />
                  <span className="font-medium text-gray-700">
                    {swimStyles.find(s => s.value === style)?.label || 'Estilo'}
                  </span>
                </span>
              )}
              {distance && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium text-gray-700">{distance}m</span>
                </span>
              )}
            </div>
          )}
          <span className="ml-auto">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {isConfigExpanded ? 'Activo' : 'Cerrado'}
            </span>
          </span>
        </div>
        {isConfigExpanded && (
          <div className="rounded-lg border bg-white p-6 shadow-sm mx-4 mb-4">
            <div className="space-y-2">
              {/* Labels */}
              <div className="grid gap-3 sm:gap-8 md:gap-12" style={{gridTemplateColumns: "2fr 1.5fr 1.3fr"}}>
                <Label htmlFor="swimmer" className="text-xs sm:text-sm font-medium block">Nadador</Label>
                <Label htmlFor="style" className="text-xs sm:text-sm font-medium block">Estilo</Label>
                <Label htmlFor="distance" className="text-xs sm:text-sm font-medium block">Distancia</Label>
              </div>
              
              {/* Selects */}
              <div className="grid gap-3 sm:gap-8 md:gap-12" style={{gridTemplateColumns: "2fr 1.5fr 1.3fr"}}>
                {/* Nadador */}
                <Select value={swimmer} onValueChange={setSwimmer}>
                  <SelectTrigger className="bg-white h-9 text-sm px-2 sm:px-3 sm:h-10 sm:text-base">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {swimmers.length === 0 ? (
                      <SelectItem value="no-swimmers" disabled>No hay nadadores</SelectItem>
                    ) : (
                      swimmers.map((child) => (
                        <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Estilo */}
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-white h-9 text-sm px-2 sm:px-3 sm:h-10 sm:text-base">
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
                  <SelectTrigger className="bg-white h-9 text-sm px-2 sm:px-3 sm:h-10 sm:text-base">
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
          </div>
        )}
      </div>

      {/* Cronómetro Principal */}
      <Card className="text-center border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
            <span className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-green-700">⭐ Mejor tiempo:</span>
              {loadingBestTime ? (
                <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-xs sm:text-sm md:text-base font-bold text-green-700">{formatTime(bestTime * 1000)}</span>
              )}
            </div>
          )}

          {/* Display del tiempo */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-blue-700 tracking-wider px-3 sm:px-4 py-3 bg-white/70 rounded-2xl shadow-sm ring-1 ring-blue-200 break-all">
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
              <Button onClick={pauseTimer} size="default" variant="secondary" className="px-3 sm:px-4 text-xs sm:text-sm h-9">
                <Pause className="h-4 w-4 mr-1.5" />
                Pausar
              </Button>
            ) : (
              <Button onClick={startTimer} size="default" className="px-3 sm:px-4 bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-9">
                <Play className="h-4 w-4 mr-1.5" />
                {state === "paused" ? "Continuar" : "Iniciar"}
              </Button>
            )}
            
            <Button 
              onClick={addLap} 
              size="default" 
              variant="outline" 
              className="px-3 sm:px-4 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-9"
              disabled={state === "stopped"}
            >
              <Flag className="h-4 w-4 mr-1.5" />
              Vuelta
            </Button>
            
            <Button 
              onClick={resetTimer} 
              size="default" 
              variant="outline" 
              className="px-3 sm:px-4 border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-9"
              disabled={state === "stopped" && time === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reiniciar
            </Button>
            
            <Button 
              onClick={stopTimer} 
              size="default" 
              variant="destructive" 
              className="px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm h-9"
              disabled={state === "stopped"}
            >
              <Square className="h-4 w-4 mr-1.5" />
              Detener
            </Button>

            {/* Botón para ver gráfico en modal */}
            <Button onClick={() => {
              router.push('/parents/records');
            }} size="default" variant="outline" className="px-3 sm:px-4 text-xs sm:text-sm h-9">
              <BarChart3 className="h-4 w-4 mr-1.5" />
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
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-10 text-sm" 
              size="default"
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
          <CardContent className="pt-4 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2">
              <div className="text-left flex-1">
                <p className="text-xs text-gray-600 mb-1">Mejor tiempo</p>
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-700">{formatTime(bestTime * 1000)}</p>
              </div>
              <div className="text-left sm:text-right flex-1">
                <p className="text-xs text-gray-600 mb-1">Tiempo actual</p>
                <p className={`text-base sm:text-lg md:text-xl font-bold ${time < bestTime * 1000 ? 'text-green-600' : time > bestTime * 1000 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {formatTime(time)}
                </p>
              </div>
              <div className="text-left sm:text-center flex-1">
                <p className="text-xs text-gray-600 mb-1">Diferencia</p>
                <p className={`text-base sm:text-lg md:text-xl font-bold ${time < bestTime * 1000 ? 'text-green-600' : 'text-orange-600'}`}>
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