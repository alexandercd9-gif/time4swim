"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Download, ExternalLink, Clock, Bell, Check, X, HelpCircle, Users } from 'lucide-react';
import { downloadICS, openGoogleCalendar } from '@/lib/calendar';
import { calculateCategory } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function ParentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [participations, setParticipations] = useState<Map<string, Map<string, any>>>(new Map());
  const [updatingParticipation, setUpdatingParticipation] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar hijos del padre
        const childrenRes = await fetch('/api/swimmers', { credentials: 'include' });
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setChildren(childrenData);
        }

        // Cargar eventos
        console.log('🔍 Fetching events from /api/parent/events...');
        const res = await fetch('/api/parent/events', { credentials: 'include' });
        console.log('📡 Response status:', res.status, res.statusText);
        if (!res.ok) {
          console.log('❌ Response not OK');
          setEvents([]);
          return;
        }
        const data = await res.json();
        console.log('✅ Events received:', data);
        console.log('📊 Total events:', data.length);
        setEvents(data);
        
        // Marcar eventos como vistos
        localStorage.setItem('lastEventCheck', new Date().toISOString());

        // Cargar participaciones para cada evento
        const participationsMap = new Map();
        for (const event of data) {
          const participRes = await fetch(`/api/parent/events/${event.id}/participation`, {
            credentials: 'include',
          });
          if (participRes.ok) {
            const eventParticipations = await participRes.json();
            const childMap = new Map();
            eventParticipations.forEach((p: any) => {
              childMap.set(p.childId, p);
            });
            participationsMap.set(event.id, childMap);
          }
        }
        setParticipations(participationsMap);
      } catch (e) {
        console.error('❌ Error fetching data', e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDownloadICS = (ev: any) => {
    try {
      downloadICS({
        title: ev.title,
        startDate: new Date(ev.date),
        location: ev.location || undefined,
        description: ev.club ? `Evento de ${ev.club}` : undefined,
      });
      toast.success('Evento descargado para tu calendario');
    } catch (error) {
      toast.error('Error al descargar evento');
    }
  };

  const handleOpenGoogleCalendar = (ev: any) => {
    try {
      openGoogleCalendar({
        title: ev.title,
        startDate: new Date(ev.date),
        location: ev.location || undefined,
        description: ev.club ? `Evento de ${ev.club}` : undefined,
      });
    } catch (error) {
      toast.error('Error al abrir Google Calendar');
    }
  };

  const updateParticipation = async (eventId: string, childId: string, status: string) => {
    const key = `${eventId}-${childId}`;
    setUpdatingParticipation(key);
    
    try {
      const res = await fetch(`/api/parent/events/${eventId}/participation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ childId, status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update participation');
      }

      const updated = await res.json();
      
      // Actualizar estado local
      setParticipations(prev => {
        const newMap = new Map(prev);
        if (!newMap.has(eventId)) {
          newMap.set(eventId, new Map());
        }
        newMap.get(eventId)!.set(childId, updated);
        return newMap;
      });

      const statusMessages: Record<string, string> = {
        CONFIRMED: '✅ Confirmado',
        DECLINED: '❌ No participará',
        MAYBE: '🤔 Tal vez',
      };

      toast.success(statusMessages[status] || 'Respuesta guardada');
    } catch (error) {
      console.error('Error updating participation:', error);
      toast.error('Error al guardar respuesta');
    } finally {
      setUpdatingParticipation(null);
    }
  };

  const getEligibleChildren = (event: any) => {
    if (!event.eligibleCategories || event.eligibleCategories.length === 0) {
      // Evento abierto a todas las categorías
      return children.filter(child => child.clubId === event.clubId);
    }

    const competitionYear = new Date(event.date).getFullYear();
    
    return children.filter(child => {
      if (child.clubId !== event.clubId) return false;
      
      const category = calculateCategory(child.birthDate, competitionYear);
      return event.eligibleCategories.includes(category.code);
    });
  };

  const getParticipationStatus = (eventId: string, childId: string) => {
    return participations.get(eventId)?.get(childId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header (match Mis Hijos spacing) */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              Próximas Competencias
            </h1>
            <p className="text-gray-600">Eventos publicados por el club</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay eventos próximos</p>
          <p className="text-sm text-gray-500">
            Solo verás eventos de los clubes a los que pertenecen tus nadadores. 
            {' '}Asegúrate de que tus hijos tengan un club asignado para ver los eventos correspondientes.
          </p>
          </div>
        ) : (
          <div className="space-y-4">
          {events.map((ev: any) => {
            const eligibleChildren = getEligibleChildren(ev);
            const competitionYear = new Date(ev.date).getFullYear();
            
            return (
            <div key={ev.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ev.title}</h3>
                  {ev.club && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Club:</span> {ev.club}
                    </div>
                  )}
                  
                  {/* Categorías elegibles */}
                  {ev.eligibleCategories && ev.eligibleCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-gray-500">Categorías:</span>
                      {ev.eligibleCategories.map((catCode: string) => (
                        <span
                          key={catCode}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {catCode.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                  <Calendar className="h-4 w-4" />
                  {new Date(ev.date).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {ev.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {ev.location}
                </div>
              )}

              {/* Hijos elegibles para este evento */}
              {eligibleChildren.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {eligibleChildren.length === 1 ? '¿Tu hijo participará?' : '¿Tus hijos participarán?'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {eligibleChildren.map((child) => {
                      const category = calculateCategory(child.birthDate, competitionYear);
                      const participation = getParticipationStatus(ev.id, child.id);
                      const isUpdating = updatingParticipation === `${ev.id}-${child.id}`;
                      
                      return (
                        <div key={child.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                          <div className="flex items-center gap-3">
                            {child.photo ? (
                              <img src={child.photo} alt={child.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {child.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{child.name}</p>
                              <p className="text-xs text-gray-500">
                                {category.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isUpdating ? (
                              <div className="text-xs text-gray-500">Guardando...</div>
                            ) : participation ? (
                              <div className="flex items-center gap-2">
                                {participation.status === 'CONFIRMED' && (
                                  <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium">
                                    ✅ Confirmado
                                  </span>
                                )}
                                {participation.status === 'DECLINED' && (
                                  <span className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 font-medium">
                                    ❌ No participa
                                  </span>
                                )}
                                {participation.status === 'MAYBE' && (
                                  <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 font-medium">
                                    🤔 Tal vez
                                  </span>
                                )}
                              </div>
                            ) : null}
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={participation?.status === 'CONFIRMED' ? 'default' : 'outline'}
                                onClick={() => updateParticipation(ev.id, child.id, 'CONFIRMED')}
                                disabled={isUpdating}
                                className={`h-8 px-2 ${participation?.status === 'CONFIRMED' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={participation?.status === 'MAYBE' ? 'default' : 'outline'}
                                onClick={() => updateParticipation(ev.id, child.id, 'MAYBE')}
                                disabled={isUpdating}
                                className={`h-8 px-2 ${participation?.status === 'MAYBE' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                              >
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={participation?.status === 'DECLINED' ? 'default' : 'outline'}
                                onClick={() => updateParticipation(ev.id, child.id, 'DECLINED')}
                                disabled={isUpdating}
                                className={`h-8 px-2 ${participation?.status === 'DECLINED' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {eligibleChildren.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Ninguno de tus hijos es elegible para este evento (categoría o club no coincide).
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  Agregar a tu calendario:
                </div>
                <button
                  onClick={() => handleDownloadICS(ev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar .ics
                </button>
                <button
                  onClick={() => handleOpenGoogleCalendar(ev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Calendar
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
