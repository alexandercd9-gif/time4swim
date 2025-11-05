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
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/parent/events', { credentials: 'include' });
        if (!r.ok) throw new Error('no feed');
        const data = await r.json();
        if (!mounted) return;
        const first = (data || [])?.[0];
        if (first) {
          setEvent({
            id: first.id || String(first._id || Math.random()),
            title: first.title || first.name || 'Evento',
            date: first.date || first.start || new Date().toISOString(),
            club: first.club?.name || first.club || undefined,
            location: first.location || first.place || undefined,
          });
        } else {
          setEvent(null);
        }
      } catch (e) {
        setEvent(null);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const onICS = () => {
    if (!event) return;
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

  const onGoogle = () => {
    if (!event) return;
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
    <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/70 rounded-md border border-amber-100 shadow-sm">
          <CalendarDays className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{loading ? 'Cargando evento…' : (event ? 'Próximo evento' : 'No hay eventos próximos')}</p>
            <Link href="/parents/events" className="text-xs text-orange-700 hover:underline whitespace-nowrap">Ver todos</Link>
          </div>
          {event && (
            <div className="mt-1 text-xs text-gray-700 space-y-1">
              <div className="font-medium truncate">{event.title}</div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(event.date).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                {event.club && <span className="mx-1">•</span>}
                {event.club && <span className="text-gray-500">{event.club}</span>}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
              <div className="pt-1 flex items-center gap-2">
                <button onClick={onICS} className="flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
                  <Download className="h-3 w-3" /> .ics
                </button>
                <button onClick={onGoogle} className="flex items-center gap-1 px-2 py-1 text-[11px] bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition-colors">
                  <ExternalLink className="h-3 w-3" /> Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
