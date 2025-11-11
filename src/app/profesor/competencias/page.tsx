"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Waves, MapPin, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Event {
  id: string;
  title: string;
  distance: number;
  style: string;
  eventDate: string;
  location?: string;
  competitionType: string;
  heats: {
    id: string;
    number: number;
    lanes: {
      id: string;
      laneNumber: number;
      swimmerId: string | null;
      coachId: string;
      swimmer: {
        id: string;
        name: string;
        lastName: string;
      } | null;
    }[];
  }[];
}

export default function ProfesorCompetenciasPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'proximas' | 'completadas'>('proximas');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/club/events/active');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo competencias internas
        const internalCompetitions = data.filter((event: Event) => event.competitionType === 'internal');
        setEvents(internalCompetitions);
      } else {
        toast.error('Error al cargar competencias');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el ID del usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  // Pusher: Escuchar cuando se asignan nuevos carriles
  useEffect(() => {
    if (!userId) return;

    // Importar dinámicamente para evitar errores de SSR
    import('@/lib/pusher-client').then(({ subscribeToPusherChannel, unsubscribeFromPusherChannel }) => {
      const channel = subscribeToPusherChannel('profesor-updates');
      
      if (channel) {
        console.log('📡 Profesor suscrito a actualizaciones');
        
        channel.bind('lanes-assigned', (data: any) => {
          console.log('🔔 Nuevos carriles asignados:', data);
          toast.success('🔔 Se han actualizado las competencias', { duration: 3000 });
          // Recargar eventos automáticamente
          fetchEvents();
        });
      }

      return () => {
        unsubscribeFromPusherChannel('profesor-updates');
      };
    });
  }, [userId]);

  // Obtener solo los carriles asignados a este profesor
  const getMyLanes = (event: Event) => {
    if (!userId) return [];
    
    const myLanes = event.heats.flatMap(heat => 
      heat.lanes
        .filter(lane => lane.coachId === userId) // Solo mis carriles
        .map(lane => ({
          heatNumber: heat.number,
          laneId: lane.id,
          laneNumber: lane.laneNumber,
          swimmer: lane.swimmer,
          hasSwimmer: !!lane.swimmer
        }))
    );
    return myLanes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  // Filtrar eventos por pestaña
  const now = new Date();
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    if (activeTab === 'proximas') {
      return eventDate >= now;
    } else {
      return eventDate < now;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Waves className="w-10 h-10 text-blue-600" />
                Competiciones
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Competencias internas donde tienes carriles asignados
              </p>
            </div>
            
            <Button
              onClick={fetchEvents}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('proximas')}
            className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
              activeTab === 'proximas'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Próximas ({events.filter(e => new Date(e.eventDate) >= now).length})
          </button>
          <button
            onClick={() => setActiveTab('completadas')}
            className={`px-6 py-3 font-semibold transition-colors border-b-4 ${
              activeTab === 'completadas'
                ? 'text-green-600 border-green-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Completadas ({events.filter(e => new Date(e.eventDate) < now).length})
          </button>
        </div>

        {/* Lista de Competencias */}
        {filteredEvents.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Waves className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {activeTab === 'proximas' 
                  ? 'No hay competencias próximas' 
                  : 'No hay competencias completadas'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'proximas'
                  ? 'Las competencias aparecerán aquí cuando estén disponibles'
                  : 'Las competencias completadas aparecerán aquí'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => {
              const myLanes = getMyLanes(event);
              const eventDate = new Date(event.eventDate);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              const isPast = eventDate < now;
              
              return (
                <Card key={event.id} className={`border-2 hover:shadow-lg transition-shadow ${
                  isPast ? 'border-green-200' : 'border-blue-200'
                }`}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{event.title}</CardTitle>
                          {isToday && (
                            <Badge className="bg-red-500 text-white">
                              ¡HOY!
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {event.competitionType === 'internal' ? 'Interna' : 'Externa'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Waves className="w-4 h-4" />
                            {event.distance}m {event.style}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {eventDate.toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Botón Ver Resultados para eventos completados */}
                    {isPast && (
                      <div className="mb-4">
                        <Link href={`/club/competencias/${event.id}/results`}>
                          <Button className="w-full bg-green-600 hover:bg-green-700 gap-2" size="lg">
                            🏆 Ver Resultados
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">Carriles Asignados</h4>
                        <Badge variant="secondary" className="text-sm">
                          {myLanes.length} {myLanes.length === 1 ? 'carril' : 'carriles'}
                        </Badge>
                      </div>
                      
                      {myLanes.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">
                            No tienes carriles asignados en este evento aún
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {myLanes.map((lane) => (
                            <Card 
                              key={lane.laneId} 
                              className={`border-2 transition-colors ${
                                lane.hasSwimmer 
                                  ? 'border-green-200 hover:border-green-400' 
                                  : 'border-yellow-200 hover:border-yellow-400'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-base">
                                      Serie {lane.heatNumber} • Carril {lane.laneNumber}
                                    </Badge>
                                    {!lane.hasSwimmer && (
                                      <Badge className="bg-yellow-500 text-white text-xs">
                                        Sin nadador
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Nadador</p>
                                    <p className="font-semibold text-gray-900">
                                      {lane.hasSwimmer 
                                        ? `${lane.swimmer?.name} ${lane.swimmer?.lastName}`
                                        : 'Por asignar'
                                      }
                                    </p>
                                  </div>
                                  
                                  <Link href={`/profesor/competencias/${event.id}/lane/${lane.laneId}`}>
                                    <Button 
                                      className={`w-full gap-2 ${
                                        lane.hasSwimmer 
                                          ? 'bg-green-600 hover:bg-green-700' 
                                          : 'bg-yellow-600 hover:bg-yellow-700'
                                      }`}
                                      size="sm"
                                    >
                                      <Clock className="w-4 h-4" />
                                      {lane.hasSwimmer ? 'Abrir Control' : 'Ver Asignación'}
                                      <ArrowRight className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Instrucciones */}
        <Card className="mt-8 border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              📋 Instrucciones
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Aquí verás las competencias internas donde tienes carriles asignados</li>
              <li>• Haz clic en "Abrir Control" para acceder al cronómetro de tu carril</li>
              <li>• Podrás controlar el tiempo de tu nadador de forma independiente</li>
              <li>• Los tiempos se sincronizan automáticamente con el administrador</li>
              <li>• El cronómetro global lo controla el administrador de la competencia</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
