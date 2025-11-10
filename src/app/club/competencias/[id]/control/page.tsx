"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Play, Square, RotateCcw, Clock, Users, CheckCircle, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateCategory, getCategoryByCode } from "@/lib/categories";
import { getPusherClient, subscribeToPusherChannel, unsubscribeFromPusherChannel } from "@/lib/pusher-client";

interface Event {
  id: string;
  title: string;
  lanes: number;
  style: string;
  distance: number;
  categoryDistances?: string | null;
  eligibleCategories?: string | null;
}

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
}

interface Heat {
  id: string;
  number: number;
  lanes: HeatLane[];
}

interface HeatLane {
  id: string;
  lane: number;
  swimmerId?: string;
  swimmer?: {
    id: string;
    name: string;
  };
  coach?: {
    id: string;
    name: string;
  };
  finalTime?: number; // Tiempo en milisegundos
}

export default function EventControlPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [heats, setHeats] = useState<Heat[]>([]);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [currentHeat, setCurrentHeat] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  
  // Estado de la serie actual
  const [heatStarted, setHeatStarted] = useState(false); // Si ya se dio START
  const [heatCompleted, setHeatCompleted] = useState<number[]>([]); // Series completadas
  const [laneTimes, setLaneTimes] = useState<Map<string, number>>(new Map()); // Tiempos recibidos por carril

  // Helper function para formatear tiempo (necesaria antes de los useEffect)
  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchHeats();
      fetchSwimmers();
    }
  }, [eventId]);

  // Pusher: Suscribirse al canal del evento para recibir actualizaciones de profesores
  useEffect(() => {
    if (!eventId) return;

    const channelName = `event-${eventId}`;
    const channel = subscribeToPusherChannel(channelName);

    if (channel) {
      console.log(`📡 Admin suscrito al canal: ${channelName}`);

      // Escuchar cuando un profesor envía su tiempo final
      channel.bind('lane-time-submitted', (data: any) => {
        console.log('🏁 Tiempo recibido del profesor:', data);
        
        const formattedTime = formatTime(data.finalTime);
        toast.success(`Carril ${data.laneNumber}: ${formattedTime}`, { 
          duration: 5000,
          icon: '⏱️'
        });
        
        // Actualizar tiempos locales
        setLaneTimes(prev => {
          const newMap = new Map(prev);
          newMap.set(data.laneId, data.finalTime);
          return newMap;
        });
        
        // Recargar heats para actualizar la UI con el tiempo guardado en BD
        fetchHeats();
      });
    }

    return () => {
      unsubscribeFromPusherChannel(channelName);
      console.log(`📡 Admin desuscrito del canal: ${channelName}`);
    };
  }, [eventId]);

  // Ya no necesitamos polling del servidor - solo esperamos tiempos de los profesores

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/club/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        console.log("📅 Evento cargado:", {
          title: data.title,
          distance: data.distance,
          categoryDistances: data.categoryDistances,
          eligibleCategories: data.eligibleCategories
        });
      } else {
        toast.error("Error al cargar el evento");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Error de conexión");
    }
  };

  const fetchHeats = async () => {
    try {
      const response = await fetch(`/api/club/events/${eventId}/heats`);
      if (response.ok) {
        const data = await response.json();
        console.log("Heats data from API:", data);
        // Normalizar swimmerId para que nunca sea undefined
        const normalizedData = data.map((heat: any) => ({
          ...heat,
          lanes: heat.lanes.map((lane: any) => ({
            ...lane,
            swimmerId: lane.swimmerId || lane.swimmer?.id || ""
          }))
        }));
        console.log("Normalized heats:", normalizedData);
        setHeats(normalizedData);
      } else {
        toast.error("Error al cargar las series");
      }
    } catch (error) {
      console.error("Error fetching heats:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const fetchSwimmers = async () => {
    try {
      const response = await fetch("/api/club/swimmers");
      if (response.ok) {
        const data = await response.json();
        const swimmersList = data.swimmers || [];
        setSwimmers(swimmersList);
        console.log("🏊 Nadadores cargados:", swimmersList.length);
        console.log("🏊 Primeros 3 nadadores:", swimmersList.slice(0, 3).map((s: Swimmer) => ({
          name: s.name,
          birthDate: s.birthDate,
          category: calculateCategory(s.birthDate).code
        })));
      }
    } catch (error) {
      console.error("Error fetching swimmers:", error);
    }
  };

  // Helper: Obtener todas las distancias únicas del evento
  const getAvailableDistances = () => {
    if (!event) return [];
    
    const distances = new Map<number, string[]>(); // distancia -> categorías (códigos)
    
    // Distancia general
    distances.set(event.distance, []);
    
    // Distancias personalizadas
    if (event.categoryDistances) {
      try {
        // categoryDistances puede venir como string o como objeto
        const customDistances = typeof event.categoryDistances === 'string' 
          ? JSON.parse(event.categoryDistances)
          : event.categoryDistances;
          
        Object.entries(customDistances).forEach(([categoryCode, distance]) => {
          const dist = Number(distance);
          if (!distances.has(dist)) {
            distances.set(dist, []);
          }
          distances.get(dist)!.push(categoryCode); // Guardamos el código
        });
      } catch (e) {
        console.error("Error parsing categoryDistances:", e);
      }
    }
    
    // Convertir a array ordenado y convertir códigos a nombres para display
    return Array.from(distances.entries())
      .sort(([a], [b]) => a - b)
      .map(([distance, categoryCodes]) => {
        // Convertir códigos a nombres para mostrar
        const categoryNames = categoryCodes
          .map(code => {
            const cat = getCategoryByCode(code as any);
            return cat?.name || code;
          })
          .filter(Boolean);
        
        return {
          distance,
          categories: categoryNames.length > 0 ? categoryNames : null,
          categoryCodes: categoryCodes // Mantener códigos para filtrado
        };
      });
  };

  // Helper: Obtener categorías elegibles
  const getEligibleCategories = () => {
    if (!event?.eligibleCategories) {
      console.log("⚠️ No hay eligibleCategories en el evento");
      return [];
    }
    try {
      // eligibleCategories puede venir como string o como array
      const categories = typeof event.eligibleCategories === 'string'
        ? JSON.parse(event.eligibleCategories)
        : event.eligibleCategories;
      console.log("📋 Eligible Categories:", categories);
      return categories;
    } catch (e) {
      console.error("Error parsing eligibleCategories:", e);
      return [];
    }
  };

  // Helper para determinar categoría del nadador (usando sistema centralizado)
  const getSwimmerCategory = (birthDate: string): string => {
    const category = calculateCategory(birthDate);
    return category.code; // Retorna el código (pre_minima, minima_1, etc.)
  };

  // Helper: Filtrar nadadores según distancia seleccionada
  const getFilteredSwimmers = () => {
    console.log("🔍 getFilteredSwimmers called", {
      availableDistances: getAvailableDistances().length,
      selectedDistance,
      hasEvent: !!event,
      totalSwimmers: swimmers.length
    });
    
    // Si no hay múltiples distancias, mostrar todos los nadadores
    if (getAvailableDistances().length <= 1) {
      console.log("✅ Solo una distancia, mostrando todos");
      return swimmers;
    }
    
    if (!selectedDistance || !event) {
      console.log("⚠️ No distance selected or no event");
      return swimmers;
    }
    
    if (!event.categoryDistances) {
      console.log("✅ No custom distances, mostrando todos");
      return swimmers;
    }
    
    try {
      const customDistances = typeof event.categoryDistances === 'string'
        ? JSON.parse(event.categoryDistances)
        : event.categoryDistances;
      
      const categoriesWithCustomDistance = Object.keys(customDistances);
      let categoriesToInclude: string[] = [];
      
      // Caso 1: Distancia personalizada (100m)
      if (selectedDistance !== event.distance) {
        categoriesToInclude = Object.entries(customDistances)
          .filter(([_, distance]) => Number(distance) === selectedDistance)
          .map(([categoryCode]) => categoryCode);
        
        console.log("🔍 Distancia Personalizada:", {
          selectedDistance,
          customDistances,
          categoriesToInclude
        });
      } 
      // Caso 2: Distancia general (200m) - EXCLUIR categorías con distancia personalizada
      else {
        // Obtener TODAS las categorías de TODOS los nadadores
        const allSwimmerCategories = Array.from(
          new Set(swimmers.map(s => getSwimmerCategory(s.birthDate)))
        );
        
        console.log("📊 Análisis de categorías:", {
          allSwimmerCategories,
          categoriesWithCustomDistance,
          shouldExclude: categoriesWithCustomDistance
        });
        
        // IMPORTANTE: Incluir todas las categorías de nadadores EXCEPTO las que tienen distancia personalizada
        categoriesToInclude = allSwimmerCategories.filter(
          cat => !categoriesWithCustomDistance.includes(cat)
        );
        
        console.log("🔍 Distancia General (200m):", {
          selectedDistance,
          generalDistance: event.distance,
          allSwimmerCategories,
          categoriesWithCustomDistance,
          categoriesToInclude,
          logic: 'Todas las categorías EXCEPTO las que tienen distancia personalizada'
        });
      }
      
      // Filtrar nadadores
      const filtered = swimmers.filter(swimmer => {
        const swimmerCategory = getSwimmerCategory(swimmer.birthDate);
        return categoriesToInclude.includes(swimmerCategory);
      });
      
      // Log detallado
      console.log("✅ Resultado Final:", {
        totalSwimmers: swimmers.length,
        filteredCount: filtered.length,
        categoriesToInclude,
        primerosNadadores: swimmers.slice(0, 5).map(s => ({
          name: s.name,
          birthDate: s.birthDate,
          category: getSwimmerCategory(s.birthDate),
          included: categoriesToInclude.includes(getSwimmerCategory(s.birthDate))
        }))
      });
      
      return filtered;
      
    } catch (e) {
      console.error("❌ Error parsing categoryDistances:", e);
      return swimmers;
    }
  };

  const updateSwimmer = (laneId: string, swimmerId: string | undefined) => {
    setHeats(prevHeats => 
      prevHeats.map(heat => 
        heat.number === currentHeat
          ? {
              ...heat,
              lanes: heat.lanes.map(lane =>
                lane.id === laneId
                  ? { ...lane, swimmerId }
                  : lane
              )
            }
          : heat
      )
    );
  };

  const handleSaveSwimmers = async () => {
    const currentHeatData = heats.find(h => h.number === currentHeat);
    if (!currentHeatData) return;

    // Validar que todos los carriles tengan nadador asignado
    const unassigned = currentHeatData.lanes.filter(lane => !lane.swimmerId);
    if (unassigned.length > 0) {
      toast.error(`Faltan nadadores en ${unassigned.length} ${unassigned.length === 1 ? 'carril' : 'carriles'}`);
      return;
    }

    setSaving(true);
    try {
      const assignments = currentHeatData.lanes.map(lane => ({
        laneId: lane.id,
        swimmerId: lane.swimmerId
      }));

      const response = await fetch(`/api/club/events/${eventId}/heats/${currentHeatData.id}/assign-swimmers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });

      if (response.ok) {
        toast.success('✅ Nadadores asignados correctamente');
        await fetchHeats(); // Recargar para obtener datos actualizados
        
        // Enviar evento por Pusher para notificar a profesores
        try {
          // Evento general al canal del evento
          await fetch('/api/pusher/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: `event-${eventId}`,
              event: 'swimmers-assigned',
              data: {
                heatNumber: currentHeat,
                heatId: currentHeatData.id,
                assignments: currentHeatData.lanes.map(lane => ({
                  laneId: lane.id,
                  laneNumber: lane.lane,
                  swimmerId: lane.swimmerId,
                  swimmerName: swimmers.find(s => s.id === lane.swimmerId)?.name
                })),
                timestamp: Date.now()
              }
            })
          });
          console.log('📡 Evento swimmers-assigned enviado a profesores');
        } catch (pushError) {
          console.error('Error al enviar evento Pusher:', pushError);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al asignar nadadores');
      }
    } catch (error) {
      console.error("Error saving swimmers:", error);
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    const currentHeatData = heats.find(h => h.number === currentHeat);
    if (!currentHeatData) return;

    // Validar que todos los carriles tengan nadador asignado
    const hasAllSwimmers = currentHeatData.lanes.every(lane => lane.swimmer || lane.swimmerId);
    if (!hasAllSwimmers) {
      toast.error('Debes asignar todos los nadadores antes de iniciar');
      return;
    }

    try {
      setHeatStarted(true);
      setLaneTimes(new Map()); // Limpiar tiempos previos
      toast.success("🏁 ¡Serie iniciada! Los profesores han activado sus cronómetros");
      
      // Enviar señal START a todos los profesores vía Pusher
      await fetch('/api/pusher/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `event-${eventId}`,
          event: 'heat-start',
          data: {
            heatNumber: currentHeat,
            timestamp: Date.now()
          }
        })
      });
      
      console.log('📡 Señal START enviada a todos los profesores');
    } catch (error) {
      console.error('Error starting heat:', error);
      toast.error('Error al iniciar serie');
    }
  };

  const handleCompleteHeat = () => {
    // Marcar serie como completada
    setHeatCompleted([...heatCompleted, currentHeat]);
    setHeatStarted(false);
    toast.success(`✅ Serie ${currentHeat} marcada como completada`);
  };

  const handleReset = async () => {
    try {
      setHeatStarted(false);
      setLaneTimes(new Map());
      toast('🔄 Serie reiniciada', { duration: 2000 });
      
      // Notificar a profesores para que reinicien sus cronómetros
      await fetch('/api/pusher/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `event-${eventId}`,
          event: 'heat-reset',
          data: {
            heatNumber: currentHeat,
            timestamp: Date.now()
          }
        })
      });
      
      console.log('📡 Señal RESET enviada a todos los profesores');
    } catch (error) {
      console.error('Error resetting heat:', error);
    }
  };

  const handleNextHeat = async () => {
    if (currentHeat < heats.length) {
      const nextHeat = currentHeat + 1;
      setCurrentHeat(nextHeat);
      setHeatStarted(false);
      setLaneTimes(new Map());
      toast.success(`Pasando a Serie ${nextHeat}`);
      
      // Enviar evento por Pusher
      try {
        await fetch('/api/pusher/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `event-${eventId}`,
            event: 'heat-changed',
            data: {
              heatNumber: nextHeat,
              totalHeats: heats.length,
              timestamp: Date.now()
            }
          })
        });
        console.log('📡 Evento heat-changed enviado a entrenadores');
      } catch (error) {
        console.error('Error al enviar evento Pusher:', error);
      }
    }
  };

  const currentHeatData = heats.find(h => h.number === currentHeat);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Evento no encontrado</p>
          <Link href="/club/competencias">
            <Button className="mt-4">Volver a Competencias</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/club/competencias/${eventId}/assign`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Asignación
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="w-10 h-10 text-blue-600" />
                Control de Evento
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {event.title} • {event.distance}m {event.style}
              </p>
            </div>
            
            <Badge variant="default" className="text-lg px-4 py-2">
              {heats.length} Series
            </Badge>
          </div>
        </div>

        {/* Control de Serie */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-center text-2xl">Control de Serie {currentHeat}</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center">
              {/* Estado */}
              <div className="mb-8">
                {heatStarted ? (
                  <Badge className="text-2xl px-8 py-4 bg-green-600 animate-pulse">
                    🏊 Serie en curso - Esperando tiempos de profesores
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-2xl px-8 py-4">
                    ⏸️ Serie detenida
                  </Badge>
                )}
              </div>

              {/* Tiempos recibidos */}
              {laneTimes.size > 0 && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Tiempos recibidos: {laneTimes.size} de {currentHeatData?.lanes.length || 0}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentHeatData?.lanes.map(lane => (
                      laneTimes.has(lane.id) && (
                        <Badge key={lane.id} className="text-lg px-4 py-2 bg-blue-600">
                          Carril {lane.lane}: {formatTime(laneTimes.get(lane.id)!)}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {/* Controles */}
              <div className="flex justify-center gap-4">
                {!heatStarted ? (
                  <>
                    <Button
                      size="lg"
                      onClick={handleStart}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-xl"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      DAR START
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleReset}
                      variant="outline"
                      className="px-8 py-6 text-xl"
                    >
                      <RotateCcw className="w-6 h-6 mr-2" />
                      Reiniciar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={handleCompleteHeat}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-xl"
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      Completar Serie
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleReset}
                      variant="outline"
                      className="px-8 py-6 text-xl"
                    >
                      <RotateCcw className="w-6 h-6 mr-2" />
                      Reiniciar
                    </Button>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-4">
                {!heatStarted 
                  ? "Al dar START, todos los profesores iniciarán sus cronómetros" 
                  : "Los profesores están cronometrando. Presiona COMPLETAR cuando todos hayan enviado sus tiempos."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Selector de Serie */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                if (currentHeat > 1) {
                  setCurrentHeat(currentHeat - 1);
                  setHeatStarted(false);
                  setLaneTimes(new Map());
                }
              }}
              disabled={currentHeat === 1}
              variant="outline"
            >
              Serie Anterior
            </Button>
            
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Serie {currentHeat} de {heats.length}
              </h2>
              {heatCompleted.includes(currentHeat) && (
                <Badge variant="default" className="bg-green-600 mt-2">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completada
                </Badge>
              )}
            </div>
            
            <Button
              onClick={handleNextHeat}
              disabled={currentHeat === heats.length || !heatCompleted.includes(currentHeat)}
              variant="outline"
            >
              Serie Siguiente
            </Button>
          </div>
        </div>

        {/* Selector de Distancia */}
        {getAvailableDistances().length > 1 && (
          <Card className="mb-6 border-2 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Distancia de esta serie:
                </label>
                <Select
                  value={selectedDistance?.toString() || ""}
                  onValueChange={(value) => setSelectedDistance(Number(value))}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Seleccionar distancia" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableDistances().map(({ distance, categories }) => {
                      let label = `${distance}m`;
                      if (categories && categories.length > 0) {
                        label += ` - ${categories.join(", ")}`;
                      } else if (distance === event?.distance) {
                        // Obtener categorías que usan la distancia general
                        const eligibleCats = getEligibleCategories();
                        if (event?.categoryDistances) {
                          try {
                            const customDist = typeof event.categoryDistances === 'string'
                              ? JSON.parse(event.categoryDistances)
                              : event.categoryDistances;
                              
                            const catsWithCustom = Object.keys(customDist);
                            const generalCats = eligibleCats.filter((c: string) => !catsWithCustom.includes(c));
                            if (generalCats.length > 0) {
                              label += ` - ${generalCats.join(", ")}`;
                            }
                          } catch (e) {
                            // ignore
                          }
                        }
                      }
                      return (
                        <SelectItem key={distance} value={distance.toString()}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedDistance && (
                  <Badge variant="outline" className="bg-blue-50">
                    {selectedDistance}m seleccionados
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Asignación de Nadadores */}
        {currentHeatData && (
          <Card className="mb-6">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Asignar Nadadores - Serie {currentHeat}
                </span>
                {!heatCompleted.includes(currentHeat) && (
                  <Button 
                    onClick={handleSaveSwimmers}
                    disabled={saving || heatStarted}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Nadadores
                      </>
                    )}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Alerta si no hay distancia seleccionada */}
              {getAvailableDistances().length > 1 && !selectedDistance && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Selecciona una distancia</strong> arriba para filtrar los nadadores según categoría
                  </p>
                </div>
              )}
              
              {/* Alerta si no hay nadadores disponibles */}
              {selectedDistance && getFilteredSwimmers().length === 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ No hay nadadores disponibles para la distancia de <strong>{selectedDistance}m</strong>
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentHeatData.lanes
                  .sort((a, b) => a.lane - b.lane)
                  .map((lane) => {
                    // Primero filtrar por distancia seleccionada
                    let availableSwimmers = getFilteredSwimmers();
                    
                    // Luego filtrar nadadores que ya compitieron en series anteriores
                    availableSwimmers = availableSwimmers.filter(swimmer => {
                      // Si estamos en la primera serie, mostrar todos
                      if (currentHeat === 1) return true;
                      
                      // Verificar si el nadador ya compitió en series completadas
                      const hasCompeted = heats
                        .filter(h => h.number < currentHeat && heatCompleted.includes(h.number))
                        .some(h => h.lanes.some(l => l.swimmer?.id === swimmer.id));
                      
                      return !hasCompeted;
                    });
                    
                    // Filtrar nadadores ya asignados en otros carriles de esta misma serie
                    const swimmersInCurrentHeat = currentHeatData.lanes
                      .filter(l => l.id !== lane.id) // Excluir el carril actual
                      .map(l => l.swimmerId)
                      .filter(Boolean); // Remover undefined/null
                    
                    availableSwimmers = availableSwimmers.filter(swimmer => 
                      !swimmersInCurrentHeat.includes(swimmer.id)
                    );

                    const isCompleted = heatCompleted.includes(currentHeat);

                    return (
                      <Card key={lane.id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-lg">
                              Carril {lane.lane}
                            </Badge>
                            {lane.coach && (
                              <Badge variant="secondary" className="text-xs">
                                {lane.coach.name}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-2">Nadador</p>
                              {isCompleted ? (
                                <p className="font-semibold text-gray-900">
                                  {lane.swimmer?.name || "Sin asignar"}
                                </p>
                              ) : (
                                <Select
                                  value={lane.swimmerId || lane.swimmer?.id || ""}
                                  onValueChange={(value) => updateSwimmer(lane.id, value || undefined)}
                                  disabled={heatStarted}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar nadador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSwimmers.map((swimmer) => (
                                      <SelectItem key={swimmer.id} value={swimmer.id}>
                                        {swimmer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            
                            {/* Mostrar tiempo registrado */}
                            {lane.finalTime && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-gray-600 mb-1">Tiempo Final</p>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <p className="text-lg font-bold text-green-600 font-mono">
                                    {formatTime(lane.finalTime)}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Enlace para el profesor de este carril */}
                            {(lane.swimmerId || lane.swimmer) && (
                              <div className="pt-2 border-t">
                                <Link
                                  href={`/profesor/competencias/${eventId}/lane/${lane.id}`}
                                  target="_blank"
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  Abrir control de carril
                                </Link>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta para pasar a siguiente serie */}
        {heatCompleted.includes(currentHeat) && currentHeat < heats.length && (
          <Card className="mb-6 bg-green-50 border-2 border-green-400">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">Serie {currentHeat} Completada</h3>
                    <p className="text-green-700">Puedes pasar a la siguiente serie</p>
                  </div>
                </div>
                <Button
                  onClick={handleNextHeat}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Ir a Serie {currentHeat + 1}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información sobre sincronización */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              📡 Sincronización en Tiempo Real
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los profesores pueden abrir el control de su carril haciendo clic en "Abrir control de carril"</li>
              <li>• Cuando inicies/detengas el cronómetro global, los profesores lo verán en tiempo real</li>
              <li>• Cuando los profesores marquen tiempos en sus carriles, tú los verás aquí automáticamente</li>
              <li>• La sincronización funciona a través de Pusher (WebSockets)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
