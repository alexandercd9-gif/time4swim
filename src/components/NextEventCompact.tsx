"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { downloadICS, openGoogleCalendar } from "@/lib/calendar";

interface EventItem {
  id: string;
  title: string;
  date: string; // ISO
  club?: string;
  location?: string;
}

export default function NextEventCompact() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/parent/events', { credentials: 'include' });
        if (!r.ok) throw new Error('no feed');
        const data = await r.json();
        if (!mounted) return;
        // Tomar los primeros 3 eventos de TODOS los nadadores
        const mapped = (data || []).slice(0, 3).map((item: any) => ({
          id: item.id || String(item._id || Math.random()),
          title: item.title || item.name || 'Evento',
          date: item.date || item.start || new Date().toISOString(),
          club: item.club?.name || item.club || undefined,
          location: item.location || item.place || undefined,
        }));
        setEvents(mapped);
      } catch (e) {
        setEvents([]);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const onICS = (event: EventItem) => {
    try {
      downloadICS({
        title: event.title,
        startDate: new Date(event.date),
        location: event.location || undefined,
        description: event.club ? `Evento de ${event.club}` : undefined,
      });
      toast.success('Evento añadido al calendario');
    } catch {
      toast.error('Error al descargar evento');
    }
  };

  const onGoogle = (event: EventItem) => {
    try {
      openGoogleCalendar({
        title: event.title,
        startDate: new Date(event.date),
        location: event.location || undefined,
        description: event.club ? `Evento de ${event.club}` : undefined,
      });
    } catch {
      toast.error('Error al abrir Google Calendar');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-orange-600" />
          <p className="text-sm font-semibold text-gray-900">
            {loading ? 'Cargando eventos…' : (events.length > 0 ? 'Próximos eventos' : 'No hay eventos próximos')}
          </p>
        </div>
        <Link href="/parents/events" className="text-xs text-orange-700 hover:underline whitespace-nowrap">Ver todos</Link>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.map((event) => (
          <div key={event.id} className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
            <div className="text-xs text-gray-700 space-y-1.5">
              <div className="font-semibold text-gray-900 truncate">{event.title}</div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{new Date(event.date).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                {event.club && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-gray-500 truncate">{event.club}</span>
                  </>
                )}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              <div className="pt-1 flex items-center gap-2">
                <button onClick={() => onICS(event)} className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/60 hover:bg-white text-gray-700 rounded transition-colors">
                  <Download className="h-3 w-3" /> .ics
                </button>
                <button onClick={() => onGoogle(event)} className="flex items-center gap-1 px-2 py-1 text-[11px] bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition-colors">
                  <ExternalLink className="h-3 w-3" /> Google
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
