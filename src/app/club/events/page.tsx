"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Plus, Download, ExternalLink, Pencil, Trash2, Users } from 'lucide-react';
import { downloadICS, openGoogleCalendar } from '@/lib/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export default function ClubEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/club/events', { cache: 'no-store' });
      if (!res.ok) {
        setEvents([]);
        return;
      }
      const data = await res.json();
      // El API ahora devuelve { events: [...] }
      setEvents(data.events || data || []);
    } catch (e) {
      console.error('Error fetching events', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDownloadICS = (ev: any) => {
    try {
      downloadICS({
        title: ev.title,
        startDate: new Date(ev.startDate),
        endDate: new Date(ev.endDate),
        location: ev.location || undefined,
        description: ev.club ? `Evento de ${ev.club}` : undefined,
      });
      toast.success('Archivo .ics descargado');
    } catch (error) {
      toast.error('Error al descargar evento');
    }
  };

  const handleOpenGoogleCalendar = (ev: any) => {
    try {
      openGoogleCalendar({
        title: ev.title,
        startDate: new Date(ev.startDate),
        endDate: new Date(ev.endDate),
        location: ev.location || undefined,
        description: ev.club ? `Evento de ${ev.club}` : undefined,
      });
    } catch (error) {
      toast.error('Error al abrir Google Calendar');
    }
  };

  const handleEdit = (ev: any) => {
    setEditingEvent(ev);
    // Convertir fechas ISO a formato date
    const startDateObj = new Date(ev.startDate);
    const endDateObj = new Date(ev.endDate);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setEditFormData({
      title: ev.title,
      startDate: formatDate(startDateObj),
      endDate: formatDate(endDateObj),
      location: ev.location || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title || !editFormData.startDate || !editFormData.endDate) {
      toast.error('Título, fecha de inicio y fecha de fin son requeridos');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/club/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (!res.ok) {
        throw new Error('Error al actualizar evento');
      }

      toast.success('Evento actualizado exitosamente');
      setIsEditModalOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error al actualizar evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev: any) => {
    setDeletingEvent(ev);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEvent) return;

    try {
      setDeleting(true);
      console.log('🗑️ Eliminando evento:', deletingEvent.id);
      const res = await fetch(`/api/club/events/${deletingEvent.id}`, {
        method: 'DELETE'
      });

      console.log('📡 Response status:', res.status);
      const responseData = await res.json();
      console.log('📡 Response data:', responseData);

      if (!res.ok) {
        throw new Error(responseData.error || 'Error al eliminar evento');
      }

      toast.success('Evento eliminado exitosamente');
      setIsDeleteModalOpen(false);
      setDeletingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar evento');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  // Filtrar eventos por fecha
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.startDate) >= now);
  const pastEvents = events.filter(e => new Date(e.startDate) < now);
  const displayedEvents = filter === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Eventos del Club
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona todos los eventos y competiciones del club
          </p>
        </div>
        <Link 
          href="/club/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Crear Evento
        </Link>
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
          Próximos ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            filter === 'past'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pasados ({pastEvents.length})
        </button>
      </div>

      {displayedEvents.length === 0 ? (
        <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {filter === 'upcoming' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {filter === 'upcoming' 
              ? 'Los eventos que crees aparecerán aquí y serán visibles para los padres en su dashboard.'
              : 'Los eventos completados aparecerán aquí.'}
          </p>
          {filter === 'upcoming' && (
            <Link 
              href="/club/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              Crear tu primer evento
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedEvents.map((ev: any) => {
            const isPast = new Date(ev.startDate) < now;
            
            return (
            <div key={ev.id} className={`p-6 bg-white rounded-lg shadow-sm border transition-shadow ${
              isPast 
                ? 'border-gray-300 opacity-90' 
                : 'border-gray-100 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
                    {isPast && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        Finalizado
                      </span>
                    )}
                    {ev.isInternalCompetition && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Competencia Interna
                      </span>
                    )}
                  </div>
                  {ev.club && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Club:</span> {ev.club}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                  <Calendar className="h-4 w-4" />
                  {new Date(ev.startDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                  })}
                  {new Date(ev.startDate).toDateString() !== new Date(ev.endDate).toDateString() && (
                    <> - {new Date(ev.endDate).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric'
                    })}</>
                  )}
                </div>
              </div>
              {ev.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {ev.location}
                </div>
              )}
              
              {/* Contador de participantes confirmados */}
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {ev.confirmedParticipants || 0} {ev.confirmedParticipants === 1 ? 'confirmado' : 'confirmados'}
                </span>
              </div>

              {/* Botones de acciones */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDownloadICS(ev)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Agregar a Calendario
                  </button>
                  <Link
                    href={`/club/events/${ev.id}/participants`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Participantes
                  </Link>
                  <button
                    onClick={() => handleEdit(ev)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ev)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título del evento *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Ej: Competencia Regional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Fecha de inicio *</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={editFormData.startDate}
                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Fecha de fin *</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={editFormData.endDate}
                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                placeholder="Ej: Piscina Municipal"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Eliminar Evento
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar este evento?
            </p>
            {deletingEvent && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="font-semibold text-red-900">{deletingEvent.title}</p>
                <p className="text-sm text-red-700 mt-1">
                  {new Date(deletingEvent.startDate).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric'
                  })}
                  {new Date(deletingEvent.startDate).toDateString() !== new Date(deletingEvent.endDate).toDateString() && (
                    <> - {new Date(deletingEvent.endDate).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric'
                    })}</>
                  )}
                </p>
                {deletingEvent.location && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {deletingEvent.location}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-4">
              Esta acción no se puede deshacer. El evento será eliminado permanentemente.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingEvent(null);
              }}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Evento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
