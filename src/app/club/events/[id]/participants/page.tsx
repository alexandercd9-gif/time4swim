"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Users, CheckCircle2, XCircle, HelpCircle, Clock, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { downloadICS, openGoogleCalendar } from '@/lib/calendar';

export default function EventParticipantsPage() {
  const params = useParams();
  const eventId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/club/events/${eventId}/participants`, { cache: 'no-store' });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg?.error || 'Error al cargar participantes');
        }
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar participantes');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Nombre', 'Categoría', 'Estado', 'Respondido'] as string[],
      ...data.participants.map((p: any) => [
        p.childName,
        p.category?.name || '',
        p.status,
        p.respondedAt ? new Date(p.respondedAt).toLocaleString('es-ES') : '',
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v: unknown) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participantes_${data.event?.title || 'evento'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventDate = useMemo(() => (data?.event?.startDate ? new Date(data.event.startDate) : null), [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Participantes del Evento
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona y revisa las confirmaciones para este evento
          </p>
        </div>
        <Link 
          href="/club/events" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
        >
          ← Volver a eventos
        </Link>
      </div>

      {loading ? (
        <div className="p-6 bg-white rounded-lg border text-center">Cargando...</div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      ) : !data ? (
        <div className="p-6 bg-white rounded-lg border">Sin datos</div>
      ) : (
        <>
          <div className="p-6 bg-white rounded-lg border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{data.event?.title}</h3>
                {eventDate && (
                  <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                    <Calendar className="h-4 w-4" />
                    {eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {data.event?.location && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {data.event.location}
                  </div>
                )}
                {data.event?.eligibleCategories && data.event.eligibleCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-500">Categorías:</span>
                    {data.event.eligibleCategories.map((c: string) => (
                      <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {c.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => eventDate && downloadICS({ title: data.event?.title, startDate: eventDate, location: data.event?.location })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
                    <Download className="h-4 w-4" />
                    .ics
                  </button>
                  <button onClick={() => eventDate && openGoogleCalendar({ title: data.event?.title, startDate: eventDate, location: data.event?.location })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors">
                    Google
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>Exportar CSV</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Confirmados
                </div>
                <div className="mt-1 text-2xl font-bold text-green-800">{data.summary?.confirmed || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                  <HelpCircle className="h-4 w-4" /> Tal vez
                </div>
                <div className="mt-1 text-2xl font-bold text-yellow-800">{data.summary?.maybe || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <XCircle className="h-4 w-4" /> No participa
                </div>
                <div className="mt-1 text-2xl font-bold text-red-800">{data.summary?.declined || 0}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <Clock className="h-4 w-4" /> Pendiente
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-800">{data.summary?.pending || 0}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Lista de participantes</h3>
              </div>
              <div className="text-sm text-gray-500">{data.participants?.length || 0} registros</div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Respondido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.participants || []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.childName}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        {p.category?.name || ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.status === 'CONFIRMED' && (
                        <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 font-medium">Confirmado</span>
                      )}
                      {p.status === 'DECLINED' && (
                        <span className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 font-medium">No participa</span>
                      )}
                      {p.status === 'MAYBE' && (
                        <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 font-medium">Tal vez</span>
                      )}
                      {p.status === 'INVITED' && (
                        <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium">Pendiente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {p.respondedAt ? new Date(p.respondedAt).toLocaleString('es-ES') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
