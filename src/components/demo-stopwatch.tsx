"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Lock, Timer, UserPlus } from "lucide-react";
import Link from "next/link";

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

export function DemoStopwatch() {
  const [time, setTime] = useState(0); // tiempo en milisegundos
  const [state, setState] = useState<TimerState>("stopped");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);
  
  // Datos del entrenamiento (solo para demo)
  const [swimmer, setSwimmer] = useState("");
  const [style, setStyle] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");

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

  // Mostrar mensaje de registro requerido
  const showRegisterMessage = () => {
    alert("¡Para guardar entrenamientos necesitas registrarte!\n\n🏊‍♂️ Con una cuenta podrás:\n• Guardar todos tus entrenamientos\n• Ver tu progreso y estadísticas\n• Comparar tus tiempos\n• Registrar múltiples nadadores\n\n¿Te registras ahora?");
  };

  return (
    <div className="space-y-6">
      {/* Cronómetro Principal */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Timer className="h-6 w-6" />
            Cronómetro de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display del tiempo */}
          <div className="text-6xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            {formatTime(time)}
          </div>
          
          {/* Controles principales */}
          <div className="flex justify-center gap-4">
            {state === "running" ? (
              <Button onClick={pauseTimer} size="lg" variant="outline" className="px-8">
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </Button>
            ) : (
              <Button onClick={startTimer} size="lg" className="px-8">
                <Play className="h-5 w-5 mr-2" />
                {state === "paused" ? "Continuar" : "Iniciar"}
              </Button>
            )}
            
            <Button onClick={stopTimer} size="lg" variant="destructive" className="px-8">
              <Square className="h-5 w-5 mr-2" />
              Detener
            </Button>
            
            {state === "running" && (
              <Button onClick={addLap} size="lg" variant="secondary" className="px-8">
                Vuelta
              </Button>
            )}
          </div>

          {/* Vueltas */}
          {laps.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Vueltas registradas:</h3>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {laps.map((lapTime, index) => (
                  <div key={index} className="text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-1">
                    Vuelta {index + 1}: {formatTime(lapTime)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Entrenamiento (Solo Demo) */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            Datos del Entrenamiento
            <span className="text-sm font-normal text-gray-500">(Solo visualización)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {/* Overlay de bloqueo */}
          <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  ¡Regístrate para guardar entrenamientos!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Con una cuenta podrás guardar y analizar todos tus entrenamientos
                </p>
                <Link href="/">
                  <Button size="lg">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Formulario (deshabilitado) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
            <div className="space-y-2">
              <Label>Nadador</Label>
              <Input
                placeholder="Nombre del nadador"
                value={swimmer}
                onChange={(e) => setSwimmer(e.target.value)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select value={style} onValueChange={setStyle} disabled>
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

            <div className="space-y-2">
              <Label>Distancia (metros)</Label>
              <Select value={distance} onValueChange={setDistance} disabled>
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

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Observaciones del entrenamiento"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled
              />
            </div>
          </div>

          <Button 
            onClick={showRegisterMessage}
            className="w-full" 
            size="lg"
            variant="outline"
          >
            <Lock className="h-5 w-5 mr-2" />
            Registrarse para Guardar Entrenamientos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}