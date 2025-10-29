"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Save, Timer } from "lucide-react";

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

export function Stopwatch() {
  const [time, setTime] = useState(0); // tiempo en milisegundos
  const [state, setState] = useState<TimerState>("stopped");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);
  
  // Datos del entrenamiento
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

  // Guardar entrenamiento
  const saveTraining = async () => {
    if (time === 0) return;
    
    const trainingData = {
      swimmer,
      style,
      distance: parseInt(distance),
      time: time / 1000, // convertir a segundos
      laps,
      notes,
      date: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`¡Entrenamiento guardado exitosamente!\n${result.training.swimmer} - ${result.training.style}\n${result.training.distance}m en ${formatTime(time)}`);
        
        // Limpiar formulario
        resetTimer();
        setSwimmer("");
        setStyle("");
        setDistance("");
        setNotes("");
      } else {
        const error = await response.json();
        alert(`Error al guardar: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cronómetro Principal */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Timer className="h-6 w-6" />
            Cronómetro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display del tiempo */}
          <div className="text-4xl md:text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            {formatTime(time)}
          </div>
          
          {/* Controles principales */}
          <div className="flex justify-center gap-2 flex-wrap">
            {state === "running" ? (
              <Button onClick={pauseTimer} size="default" variant="outline" className="px-6">
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            ) : (
              <Button onClick={startTimer} size="default" className="px-6">
                <Play className="h-4 w-4 mr-2" />
                {state === "paused" ? "Continuar" : "Iniciar"}
              </Button>
            )}
            
            <Button onClick={stopTimer} size="default" variant="destructive" className="px-6">
              <Square className="h-4 w-4 mr-2" />
              Detener
            </Button>
            
            {state === "running" && (
              <Button onClick={addLap} size="default" variant="secondary" className="px-6">
                Vuelta
              </Button>
            )}
          </div>

          {/* Vueltas */}
          {laps.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-sm">Vueltas registradas:</h3>
              <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                {laps.map((lapTime, index) => (
                  <div key={index} className="text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                    Vuelta {index + 1}: {formatTime(lapTime)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de Entrenamiento */}
      <Card>
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
              <Input
                id="swimmer"
                placeholder="Nombre del nadador"
                value={swimmer}
                onChange={(e) => setSwimmer(e.target.value)}
              />
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
            className="w-full" 
            size="default"
            disabled={!swimmer || !style || !distance || time === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Entrenamiento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}