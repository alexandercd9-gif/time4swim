"use client";

import { useEffect, useState } from "react";
import { Clock, CalendarDays, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { downloadICS, openGoogleCalendar } from "@/lib/calendar";

type EventItem = {
  id: string;
  title: string;
  date: string; // ISO
  club?: string;
  location?: string;
};

export default function UpcomingEvents({ limit = 5 }: { limit?: number }) {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const r = await fetch('/api/parent/events', { credentials: 'include' });
        if (!r.ok) throw new Error('no feed');
        const data = await r.json();
        if (!mounted) return;
        const list = (data || []).slice(0, limit).map((e: any) => ({
          id: e.id || String(e._id || Math.random()),
          title: e.title || e.name || 'Evento',
          date: e.date || e.start || new Date().toISOString(),
          club: e.club?.name || e.club || undefined,
          location: e.location || e.place || undefined,
        }));

        setEvents(prev => {
          if (prev && prev.length > 0 && list.length > 0 && prev[0].id !== list[0].id) {
            toast.success(`Nuevo evento publicado: ${list[0].title}`);
          }
          return list;
        });
      } catch (err) {
        if (!mounted) return;
        // Don't show placeholder events - just empty state
        setEvents([]);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    const interval = setInterval(() => load().catch(() => {}), 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  const handleDownloadICS = (ev: EventItem) => {
    try {
      downloadICS({
        title: ev.title,
        startDate: new Date(ev.date),
        location: ev.location || undefined,
        description: ev.club ? `Evento de ${ev.club}` : undefined,
      });
      toast.success('Evento añadido al calendario');
    } catch (error) {
      toast.error('Error al descargar evento');
    }
  };

  const handleOpenGoogleCalendar = (ev: EventItem) => {
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

  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-md">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Próximas competencias</h3>
            <p className="text-sm text-gray-500">Eventos sincronizados desde el club</p>
          </div>
        </div>
        <div className="text-sm">
          <Link href="/parents/events" className="text-blue-600 hover:underline">Ver todos</Link>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando eventos...</div>}

      {!loading && (!events || events.length === 0) && (
        <div className="text-sm text-gray-500">
          No hay eventos próximos de tus clubes. Asigna un club a tus nadadores para ver eventos relevantes.
        </div>
      )}

      {!loading && events && events.length > 0 && (
        <ul className="space-y-3">
          {events.map(ev => (
            <li key={ev.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{ev.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{new Date(ev.date).toLocaleString('es-ES', { 
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {ev.club && <span className="mx-1">•</span>}
                    {ev.club && <span className="text-xs text-gray-400">{ev.club}</span>}
                  </div>
                  {ev.location && (
                    <div className="text-xs text-gray-500 mt-1">{ev.location}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadICS(ev)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  title="Descargar archivo .ics"
                >
                  <Download className="h-3 w-3" />
                  .ics
                </button>
                <button
                  onClick={() => handleOpenGoogleCalendar(ev)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                  title="Abrir en Google Calendar"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
