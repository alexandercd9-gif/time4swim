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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Eventos
              </h1>
              <p className="text-gray-600 mt-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.eventDate);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              
              return (
                <Card key={event.id} className="border-2 border-purple-200 hover:shadow-lg transition-shadow overflow-hidden py-0">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 px-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      {isToday && (
                        <Badge className="bg-red-500 text-white">
                          ¡HOY!
                        </Badge>
                      )}
                      <Badge className="bg-purple-500 text-white">
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
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                          <ExternalLink className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Evento Externo</p>
                          <p className="text-sm text-gray-500">Competencia fuera del club</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
