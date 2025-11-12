"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Trophy, Calendar, Users, Timer, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InternalEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string | null;
  lanes: number;
  style: string;
  distance: number;
  categoryDistances: string | null;
  eligibleCategories: string | null;
  updatedAt: string;
  isCompleted?: boolean; // Indica si el evento fue finalizado explícitamente
  _count: {
    heatLanes: number;
  };
}

export default function CompetenciasInternasPage() {
  const [events, setEvents] = useState<InternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();

  useEffect(() => {
    fetchInternalEvents();
  }, []);

  async function fetchInternalEvents() {
    try {
      const res = await fetch('/api/club/events?internal=true', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        // Ensure updatedAt is present and parsed as string
        const mappedEvents = (data.events || []).map((e: any) => ({ ...e, updatedAt: e.updatedAt || e.createdAt }));
        console.log('📊 Eventos cargados:', mappedEvents);
        setEvents(mappedEvents);
      } else {
        toast.error('Error al cargar competencias internas');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  }

  const getStyleName = (style: string) => {
    const styles: Record<string, string> = {
      FREESTYLE: "Libre",
      BACKSTROKE: "Espalda",
      BREASTSTROKE: "Pecho",
      BUTTERFLY: "Mariposa",
      INDIVIDUAL_MEDLEY: "Combinado Individual"
    };
    return styles[style] || style;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando competencias internas...</p>
        </div>
      </div>
    );
  }

  // Filtrar eventos por estado
  // Obtener solo la fecha de hoy (sin horas) en formato YYYY-MM-DD
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Un evento se considera completado si:
  // 1. Tiene isCompleted = true (fue finalizado explícitamente)
  // 2. O si su endDate YA PASÓ (día anterior, no hoy)
  const upcomingEvents = events.filter(e => {
    // Extraer solo la fecha (YYYY-MM-DD) del endDate sin conversiones de timezone
    const endDateStr = e.endDate.substring(0, 10); // "2025-11-11"
    const isPast = endDateStr < todayDateStr; // Comparación de strings YYYY-MM-DD
    const isCompleted = e.isCompleted || false;
    
    console.log(`🔍 Evento ${e.title}:`, {
      endDateStr,
      todayDateStr,
      isCompleted,
      isPast,
      shouldBeInUpcoming: !isCompleted && !isPast
    });
    
    // Mostrar en próximas si NO está finalizado Y NO es del pasado (incluye hoy)
    return !isCompleted && !isPast;
  });
  
  const pastEvents = events.filter(e => {
    const endDateStr = e.endDate.substring(0, 10);
    const isPast = endDateStr < todayDateStr;
    const isCompleted = e.isCompleted || false;
    // Mostrar en completadas si está finalizado O si la fecha ya pasó
    return isCompleted || isPast;
  });
  console.log('📋 Resultados filtrado:', {
    total: events.length,
    upcoming: upcomingEvents.length,
    completed: pastEvents.length
  });
  const displayedEvents = filter === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            Competencias Internas
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las competencias internas del club con cronometraje en vivo
          </p>
        </div>
        <Button
          onClick={() => router.push('/club/events/new')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Nueva Competencia
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'upcoming'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Próximas ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'past'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completadas ({pastEvents.length})
        </button>
      </div>

      {/* Lista de Eventos */}
      {displayedEvents.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'upcoming' 
                ? 'No hay competencias próximas' 
                : 'No hay competencias completadas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming'
                ? 'Crea una nueva competencia interna para comenzar'
                : 'Las competencias pasadas aparecerán aquí'}
            </p>
            {filter === 'upcoming' && (
              <Button
                onClick={() => router.push('/club/events/new')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Crear Primera Competencia
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedEvents.map((event) => {
            const isConfigured = event._count.heatLanes > 0;
            const totalLanes = event.lanes || 0;
            const assignedLanes = event._count.heatLanes;
            const progress = totalLanes > 0 ? (assignedLanes / totalLanes) * 100 : 0;

            const isFinalizado = event.isCompleted || false;
            return (
              <Card
                key={event.id}
                className="border-2 hover:shadow-lg transition-shadow overflow-hidden py-0 border-blue-200"
              >
                <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 px-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    {isFinalizado && (
                      <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">
                        ✓ Completada
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                      Interna
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {event.distance}m {getStyleName(event.style)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.startDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  {filter === 'past' ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Competencia Finalizada</p>
                          <p className="text-sm text-gray-500">Los resultados están disponibles</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/club/competencias/${event.id}/results`)}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        Ver Resultados
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                          <Timer className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {isConfigured ? 'Listo para iniciar' : 'Configurar competencia'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {assignedLanes} de {totalLanes} carriles asignados
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/club/competencias/${event.id}/assign`)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 gap-2"
                      >
                        <Timer className="w-4 h-4" />
                        Iniciar Competencia
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
