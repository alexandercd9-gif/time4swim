"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Download, ExternalLink, Clock } from 'lucide-react';
import { downloadICS, openGoogleCalendar } from '@/lib/calendar';
import toast from 'react-hot-toast';

export default function ParentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
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
        
        // Marcar eventos como vistos guardando el timestamp actual
        localStorage.setItem('lastEventCheck', new Date().toISOString());
      } catch (e) {
        console.error('❌ Error fetching events', e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Próximas Competencias</h2>
        <p className="text-sm text-gray-600">Eventos publicados por el club</p>
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
          {events.map((ev: any) => (
            <div key={ev.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ev.title}</h3>
                  {ev.club && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Club:</span> {ev.club}
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

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
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
          ))}
        </div>
      )}
    </div>
  );
}
