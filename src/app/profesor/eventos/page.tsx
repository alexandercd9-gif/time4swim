"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

interface Event {
  id: string;
  title: string;
  distance: number;
  style: string;
  eventDate: string;
  location?: string;
  competitionType: string;
  heats: any[];
}

export default function ProfesorEventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/club/events/active');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo eventos externos
        const externalEvents = data.filter((event: Event) => event.competitionType === 'external');
        setEvents(externalEvents);
      } else {
        toast.error('Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-10 h-10 text-blue-600" />
                Eventos
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Eventos externos próximos
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

        {/* Lista de Eventos */}
        {events.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay eventos externos próximos
              </h3>
              <p className="text-gray-500">
                Los eventos aparecerán aquí cuando estén disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.eventDate);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              
              return (
                <Card key={event.id} className="border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
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
                            Externa
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    <div className="space-y-4">
                      <div className="text-center py-8 bg-purple-50 rounded-lg">
                        <ExternalLink className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                        <p className="text-gray-700 font-medium">
                          Evento externo programado
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Consulta los detalles con el administrador
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Información */}
        <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              ℹ️ Información
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Aquí verás los eventos externos próximos</li>
              <li>• Los eventos externos son competencias fuera del club</li>
              <li>• Para más detalles, contacta con el administrador del club</li>
              <li>• Las competencias internas las encuentras en "Competiciones"</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
