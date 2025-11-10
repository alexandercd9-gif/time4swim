"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Play, Square, RotateCcw, Clock, Users, CheckCircle, Save, Grid3x3, TableIcon } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // Vista: cuadros o tabla
  
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

  const handleCompleteHeat = async () => {
    // Marcar serie como completada
    setHeatCompleted([...heatCompleted, currentHeat]);
    setHeatStarted(false);
    toast.success(`✅ Serie ${currentHeat} completada`);
    
    // Si hay más series, avanzar automáticamente a la siguiente
    if (currentHeat < heats.length) {
      setTimeout(async () => {
        const nextHeat = currentHeat + 1;
        setCurrentHeat(nextHeat);
        setLaneTimes(new Map());
        toast.success(`📋 Avanzando a Serie ${nextHeat}`, { duration: 3000 });
        
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
      }, 1500); // Esperar 1.5 segundos antes de avanzar
    } else {
      toast.success('🏁 ¡Todas las series completadas!', { duration: 5000 });
    }
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
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 pt-8 pb-6 sm:pt-12 sm:pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link 
            href={`/club/competencias/${eventId}/assign`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Volver a Asignación
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                Control de Evento
              </h1>
              <p className="text-xs sm:text-base text-gray-600 mt-1">
                {event.title} • {event.distance}m {event.style}
              </p>
            </div>
            
            <Badge variant="default" className="text-xs sm:text-base px-2 py-1 sm:px-3 sm:py-1.5 w-fit bg-black">
              {heats.length} Series
            </Badge>
          </div>
        </div>

        {/* Selector de Serie - Compacto */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
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
            size="sm"
            className="text-xs sm:text-sm"
          >
            Serie Anterior
          </Button>
          
          <div className="text-center">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">
              Serie {currentHeat} de {heats.length}
            </h2>
            {heatCompleted.includes(currentHeat) && (
              <Badge variant="default" className="bg-green-600 mt-1 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completada
              </Badge>
            )}
          </div>
          
          <Button
            onClick={handleNextHeat}
            disabled={currentHeat === heats.length || !heatCompleted.includes(currentHeat)}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
          >
            Serie Siguiente
          </Button>
        </div>

        {/* Layout de 2 columnas: 70% Nadadores + 30% Control */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* COLUMNA IZQUIERDA: Asignación de Nadadores (70%) */}
          <div className="lg:w-[70%] space-y-4 order-2 lg:order-1">
            {/* Selector de Distancia */}
            {getAvailableDistances().length > 1 && (
              <Card className="border border-gray-300">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700 whitespace-nowrap">
                      Distancia:
                    </label>
                    <Select
                      value={selectedDistance?.toString() || ""}
                      onValueChange={(value) => setSelectedDistance(Number(value))}
                    >
                      <SelectTrigger className="flex-1 text-xs font-medium h-8">
                        <SelectValue placeholder="Seleccionar distancia" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDistances().map(({ distance, categories }) => {
                          let label = `${distance}m`;
                          if (categories && categories.length > 0) {
                            label += ` - ${categories.join(", ")}`;
                          } else if (distance === event?.distance) {
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
                      <Badge className="bg-blue-600 text-white text-xs font-bold px-2 py-1">
                        {selectedDistance}m
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Asignación de Nadadores */}
            {currentHeatData && (
              <Card className="border border-gray-200 overflow-hidden p-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 m-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-sm font-bold">
                        <Users className="w-4 h-4" />
                        Serie {currentHeat} - Nadadores
                      </span>
                      
                      {/* Toggle Vista: Cuadros / Tabla */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewMode('grid')}
                          className={`h-7 px-3 text-xs font-semibold ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                          <Grid3x3 className="w-3 h-3 mr-1" />
                          Cuadros
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewMode('table')}
                          className={`h-7 px-3 text-xs font-semibold ${viewMode === 'table' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                          <TableIcon className="w-3 h-3 mr-1" />
                          Tabla
                        </Button>
                      </div>
                    </div>
                    
                    {!heatCompleted.includes(currentHeat) && (
                      <Button 
                        onClick={handleSaveSwimmers}
                        disabled={saving || heatStarted}
                        size="sm"
                        className="bg-white text-blue-600 hover:bg-blue-50 text-xs font-semibold h-7"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1" />
                            Guardar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  {/* Alertas */}
                  {getAvailableDistances().length > 1 && !selectedDistance && (
                    <div className="mb-2 p-1.5 bg-yellow-50 border border-yellow-300 rounded text-xs font-medium">
                      ⚠️ <strong>Selecciona una distancia</strong> arriba
                    </div>
                  )}
                  
                  {selectedDistance && getFilteredSwimmers().length === 0 && (
                    <div className="mb-2 p-1.5 bg-red-50 border border-red-300 rounded text-xs font-medium">
                      ❌ No hay nadadores para {selectedDistance}m
                    </div>
                  )}
              
                  {/* Vista de Carriles - Grid o Tabla */}
                  {viewMode === 'grid' ? (
                    /* VISTA EN CUADROS */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                      {currentHeatData.lanes
                  .sort((a, b) => a.lane - b.lane)
                  .map((lane) => {
                    // Primero filtrar por distancia seleccionada
                    let availableSwimmers = getFilteredSwimmers();
                    
                    // Filtrar nadadores que ya compitieron en CUALQUIER serie (completada o no)
                    availableSwimmers = availableSwimmers.filter(swimmer => {
                      // Verificar si el nadador ya tiene tiempo registrado en alguna serie
                      const hasCompeted = heats.some(h => 
                        h.lanes.some(l => 
                          l.swimmer?.id === swimmer.id && l.finalTime != null
                        )
                      );
                      
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

                    return {
                      ...lane,
                      availableSwimmers,
                      isCompleted
                    };
                  })
                  // Ordenar por tiempo final (más rápido primero), los sin tiempo al final
                  .sort((a, b) => {
                    if (!a.finalTime && !b.finalTime) return a.lane - b.lane; // Sin tiempo: orden por carril
                    if (!a.finalTime) return 1; // a sin tiempo va al final
                    if (!b.finalTime) return -1; // b sin tiempo va al final
                    return a.finalTime - b.finalTime; // Ordenar por tiempo ascendente
                  })
                  .map((lane, index) => {
                    const position = lane.finalTime ? index + 1 : null;
                    const isFirst = position === 1;
                    const isSecond = position === 2;
                    const isThird = position === 3;

                    return (
                      <Card 
                        key={lane.id} 
                        className={`border-2 transition-all ${
                          isFirst ? 'border-yellow-400 bg-yellow-50' : 
                          isSecond ? 'border-gray-400 bg-gray-50' : 
                          isThird ? 'border-orange-400 bg-orange-50' : 
                          'border-gray-200'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {/* Header con carril, entrenador y posición */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-bold text-sm px-2 py-0.5">
                                  C{lane.lane}
                                </Badge>
                                {position && (
                                  <Badge className={`text-sm font-bold ${
                                    isFirst ? 'bg-yellow-500' : 
                                    isSecond ? 'bg-gray-500' : 
                                    isThird ? 'bg-orange-500' : 
                                    'bg-blue-500'
                                  }`}>
                                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${position}`}
                                  </Badge>
                                )}
                              </div>
                              {lane.coach && (
                                <span className="text-xs text-gray-600 font-medium">{lane.coach.name}</span>
                              )}
                            </div>
                            
                            {/* Nadador con select más grande */}
                            <div>
                              {lane.isCompleted || lane.finalTime ? (
                                <p className="font-bold text-base text-gray-900">
                                  {lane.swimmer?.name || "Sin asignar"}
                                </p>
                              ) : (
                                <Select
                                  value={lane.swimmerId || lane.swimmer?.id || ""}
                                  onValueChange={(value) => updateSwimmer(lane.id, value || undefined)}
                                  disabled={heatStarted || lane.finalTime != null}
                                >
                                  <SelectTrigger className="w-full text-sm font-medium h-9">
                                    <SelectValue placeholder="Seleccionar nadador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {lane.availableSwimmers.map((swimmer) => (
                                      <SelectItem key={swimmer.id} value={swimmer.id} className="text-sm">
                                        {swimmer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            
                            {/* Tiempo registrado - MÁS GRANDE */}
                            {lane.finalTime && (
                              <div className={`pt-2 border-t-2 ${
                                isFirst ? 'border-yellow-300' : 
                                isSecond ? 'border-gray-300' : 
                                isThird ? 'border-orange-300' : 
                                'border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600 font-medium">Tiempo</span>
                                  <p className={`text-xl font-bold font-mono ${
                                    isFirst ? 'text-yellow-600' : 
                                    isSecond ? 'text-gray-600' : 
                                    isThird ? 'text-orange-600' : 
                                    'text-green-600'
                                  }`}>
                                    {formatTime(lane.finalTime)}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Enlace control - más compacto */}
                            {(lane.swimmerId || lane.swimmer) && !lane.isCompleted && (
                              <Link
                                href={`/profesor/competencias/${eventId}/lane/${lane.id}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-1"
                              >
                                <Clock className="w-3 h-3" />
                                Abrir control
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                    </div>
                  ) : (
                    /* VISTA EN TABLA */
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300">
                          <tr>
                            <th className="px-2 py-2 text-left font-bold">Pos.</th>
                            <th className="px-2 py-2 text-left font-bold">Carril</th>
                            <th className="px-2 py-2 text-left font-bold">Entrenador</th>
                            <th className="px-2 py-2 text-left font-bold">Nadador</th>
                            <th className="px-2 py-2 text-left font-bold">Tiempo</th>
                            <th className="px-2 py-2 text-left font-bold">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentHeatData.lanes
                            .sort((a, b) => a.lane - b.lane)
                            .map((lane) => {
                              let availableSwimmers = getFilteredSwimmers();
                              availableSwimmers = availableSwimmers.filter(swimmer => {
                                const hasCompeted = heats.some(h => 
                                  h.lanes.some(l => l.swimmer?.id === swimmer.id && l.finalTime != null)
                                );
                                return !hasCompeted;
                              });
                              const swimmersInCurrentHeat = currentHeatData.lanes
                                .filter(l => l.id !== lane.id)
                                .map(l => l.swimmerId)
                                .filter(Boolean);
                              availableSwimmers = availableSwimmers.filter(swimmer => 
                                !swimmersInCurrentHeat.includes(swimmer.id)
                              );
                              const isCompleted = heatCompleted.includes(currentHeat);
                              return { ...lane, availableSwimmers, isCompleted };
                            })
                            .sort((a, b) => {
                              if (!a.finalTime && !b.finalTime) return a.lane - b.lane;
                              if (!a.finalTime) return 1;
                              if (!b.finalTime) return -1;
                              return a.finalTime - b.finalTime;
                            })
                            .map((lane, index) => {
                              const position = lane.finalTime ? index + 1 : null;
                              const isFirst = position === 1;
                              const isSecond = position === 2;
                              const isThird = position === 3;

                              return (
                                <tr 
                                  key={lane.id}
                                  className={`border-b transition-colors ${
                                    isFirst ? 'bg-yellow-50 hover:bg-yellow-100' : 
                                    isSecond ? 'bg-gray-50 hover:bg-gray-100' : 
                                    isThird ? 'bg-orange-50 hover:bg-orange-100' : 
                                    'hover:bg-gray-50'
                                  }`}
                                >
                                  <td className="px-2 py-2">
                                    {position && (
                                      <Badge className={`text-xs font-bold ${
                                        isFirst ? 'bg-yellow-500' : 
                                        isSecond ? 'bg-gray-500' : 
                                        isThird ? 'bg-orange-500' : 
                                        'bg-blue-500'
                                      }`}>
                                        {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${position}`}
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="px-2 py-2 font-bold">C{lane.lane}</td>
                                  <td className="px-2 py-2 text-gray-600">{lane.coach?.name || '-'}</td>
                                  <td className="px-2 py-2">
                                    {lane.isCompleted || lane.finalTime ? (
                                      <span className="font-semibold">{lane.swimmer?.name || "Sin asignar"}</span>
                                    ) : (
                                      <Select
                                        value={lane.swimmerId || lane.swimmer?.id || ""}
                                        onValueChange={(value) => updateSwimmer(lane.id, value || undefined)}
                                        disabled={heatStarted || lane.finalTime != null}
                                      >
                                        <SelectTrigger className="w-full text-xs h-8">
                                          <SelectValue placeholder="Seleccionar nadador" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {lane.availableSwimmers.map((swimmer) => (
                                            <SelectItem key={swimmer.id} value={swimmer.id} className="text-xs">
                                              {swimmer.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </td>
                                  <td className="px-2 py-2">
                                    {lane.finalTime ? (
                                      <span className={`font-mono font-bold text-base ${
                                        isFirst ? 'text-yellow-600' : 
                                        isSecond ? 'text-gray-600' : 
                                        isThird ? 'text-orange-600' : 
                                        'text-green-600'
                                      }`}>
                                        {formatTime(lane.finalTime)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">Esperando...</span>
                                    )}
                                  </td>
                                  <td className="px-2 py-2">
                                    {(lane.swimmerId || lane.swimmer) && !lane.isCompleted && (
                                      <Link
                                        href={`/profesor/competencias/${eventId}/lane/${lane.id}`}
                                        target="_blank"
                                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                      >
                                        <Clock className="w-3 h-3" />
                                        Abrir
                                      </Link>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUMNA DERECHA: Control de Serie (30%) */}
          <div className="lg:w-[30%] order-1 lg:order-2 space-y-4">
            {/* Panel de Control - Adapta altura */}
            <Card className="border-2 border-blue-500 shadow-lg lg:sticky lg:top-4">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3">
                <CardTitle className="text-center text-lg font-bold">
                  Control de Serie {currentHeat}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {/* Estado */}
                <div className="text-center">
                  {heatStarted ? (
                    <Badge className="text-sm px-4 py-2 bg-green-600 animate-pulse font-bold">
                      🏊 Serie en curso
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-sm px-4 py-2 font-bold">
                      ⏸️ Serie detenida
                    </Badge>
                  )}
                </div>

                {/* Tiempos recibidos */}
                {laneTimes.size > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm font-bold text-gray-700 mb-2 text-center">
                      Tiempos recibidos
                    </p>
                    <p className="text-3xl font-bold text-blue-600 text-center mb-2">
                      {laneTimes.size} / {currentHeatData?.lanes.length || 0}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {currentHeatData?.lanes.map(lane => (
                        laneTimes.has(lane.id) && (
                          <Badge key={lane.id} className="text-xs px-2 py-1 bg-green-600 font-mono">
                            C{lane.lane}: {formatTime(laneTimes.get(lane.id)!)}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de Control */}
                <div className="space-y-2 pt-2">
                  {!heatStarted ? (
                    <>
                      <Button
                        onClick={handleStart}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-bold shadow-md"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        DAR START
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="w-full py-3 text-sm font-semibold"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reiniciar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCompleteHeat}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold shadow-md"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Completar Serie
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="w-full py-3 text-sm font-semibold"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reiniciar
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-600 text-center bg-gray-50 p-2 rounded border border-gray-200">
                  {!heatStarted 
                    ? "💡 Al dar START, todos los profesores iniciarán sus cronómetros simultáneamente" 
                    : "⏱️ Los profesores están cronometrando. Presiona COMPLETAR cuando todos hayan enviado sus tiempos."}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
