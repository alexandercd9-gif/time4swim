"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, User, Save, Trash2, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Event {
  id: string;
  title: string;
  lanes: number;
  style: string;
  distance: number;
}

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface LaneCoach {
  lane: number;
  coachId: string | undefined;
}

export default function AssignLanesPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [laneCoaches, setLaneCoaches] = useState<LaneCoach[]>([]); // Solo profesores por carril
  const [numLanes, setNumLanes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchSwimmers();
      fetchCoaches();
      fetchExistingAssignments();
    }
  }, [eventId]);

  async function fetchEventData() {
    try {
      const res = await fetch(`/api/club/events/${eventId}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        // No inicializamos assignments aquí, se generarán dinámicamente
      } else {
        toast.error('Error al cargar evento');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    }
  }

  // Generar carriles dinámicamente cuando cambia numLanes
  useEffect(() => {
    const newLaneCoaches: LaneCoach[] = [];
    for (let i = 1; i <= numLanes; i++) {
      const existing = laneCoaches.find(lc => lc.lane === i);
      newLaneCoaches.push(existing || {
        lane: i,
        coachId: undefined,
      });
    }
    setLaneCoaches(newLaneCoaches);
  }, [numLanes]);

  async function fetchSwimmers() {
    try {
      const res = await fetch('/api/club/swimmers', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setSwimmers(data.swimmers || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCoaches() {
    try {
      const res = await fetch('/api/club/coaches', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setCoaches(data.coaches || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchExistingAssignments() {
    try {
      // Esta funcionalidad ya no existe, los carriles se crean al guardar
      // Simplemente marcamos como cargado
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  async function handleStartEvent() {
    // Validar que todos los carriles tengan profesor
    const incomplete = laneCoaches.filter(lc => !lc.coachId);
    
    if (incomplete.length > 0) {
      toast.error(`Faltan profesores en ${incomplete.length} ${incomplete.length === 1 ? 'carril' : 'carriles'}`);
      return;
    }

    setSaving(true);
    try {
      // Guardar la asignación de profesores a carriles en la base de datos
      const response = await fetch(`/api/club/events/${eventId}/heats/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ laneCoaches })
      });

      if (response.ok) {
        toast.success('✅ Carriles asignados correctamente');
        router.push(`/club/competencias/${eventId}/control`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    } finally {
      setSaving(false);
    }
  }

  function updateCoach(lane: number, coachId: string | undefined) {
    setLaneCoaches(prev =>
      prev.map(lc =>
        lc.lane === lane ? { ...lc, coachId } : lc
      )
    );
  }

  async function handleSaveCoaches() {
    // Esta función ya no se usa, pero la dejamos por si acaso
    handleStartEvent();
  }

  const getStyleName = (style: string) => {
    const styles: Record<string, string> = {
      FREESTYLE: "Libre",
      BACKSTROKE: "Espalda",
      BREASTSTROKE: "Pecho",
      BUTTERFLY: "Mariposa",
      INDIVIDUAL_MEDLEY: "Combinado Individual"
    };
    return styles[style] || style;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="text-gray-600">Evento no encontrado</p>
        <Button onClick={() => router.push('/club/competencias')} className="mt-4">
          Volver a Competencias
        </Button>
      </div>
    );
  }

  const allAssigned = laneCoaches.every(lc => lc.coachId);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pt-6 pb-8">
      {/* Header compacto */}
      <div>
        <Link
          href="/club/competencias"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Configurar Competencia</h1>
        </div>
        <p className="text-sm text-gray-600">
          {event.title} • {event.distance}m {getStyleName(event.style)}
        </p>
      </div>

      {/* Card único con todo el flujo */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-4 space-y-3">
          
          {/* PASO 1 - En línea */}
          <div className={`flex items-center justify-between p-2.5 rounded-lg ${
            numLanes > 0 ? 'bg-green-50' : 'bg-purple-50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${
                numLanes > 0 ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'
              }`}>
                {numLanes > 0 ? '✓' : '1'}
              </div>
              <span className={`text-sm font-semibold ${
                numLanes > 0 ? 'text-green-900' : 'text-purple-900'
              }`}>
                {numLanes > 0 ? `${numLanes} carriles` : 'Carriles'}
              </span>
            </div>
            <Select 
              value={numLanes > 0 ? numLanes.toString() : ""} 
              onValueChange={(value) => setNumLanes(parseInt(value))}
            >
              <SelectTrigger className="w-[100px] bg-white border h-8 text-sm">
                <SelectValue placeholder="1-8" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PASO 2 - Tabla compacta en línea */}
          {numLanes > 0 && (
            <>
              <div className={`flex items-center gap-2 p-2.5 rounded-lg ${
                allAssigned ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <div className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${
                  allAssigned ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {allAssigned ? '✓' : '2'}
                </div>
                <span className={`text-sm font-semibold ${
                  allAssigned ? 'text-green-900' : 'text-blue-900'
                }`}>
                  Entrenadores {allAssigned ? '✓' : `(${laneCoaches.filter(lc => lc.coachId).length}/${numLanes})`}
                </span>
              </div>

              {!allAssigned && (
                <div className="space-y-1.5 pl-8">
                  {laneCoaches.map((laneCoach) => {
                    // Filtrar entrenadores ya asignados en otros carriles
                    const assignedCoachIds = laneCoaches
                      .filter(lc => lc.lane !== laneCoach.lane && lc.coachId) // Excluir el carril actual
                      .map(lc => lc.coachId);
                    
                    const availableCoaches = coaches.filter(
                      coach => !assignedCoachIds.includes(coach.id)
                    );

                    return (
                      <div
                        key={laneCoach.lane}
                        className={`flex items-center gap-3 p-2 rounded border ${
                          laneCoach.coachId ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          {laneCoach.lane}
                        </span>
                        <span className="text-sm font-medium w-16">Carril {laneCoach.lane}</span>
                        <Select
                          value={laneCoach.coachId}
                          onValueChange={(value) => updateCoach(laneCoach.lane, value)}
                        >
                          <SelectTrigger className="flex-1 bg-white h-8 text-sm">
                            <SelectValue placeholder="Seleccionar entrenador" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCoaches.map((coach) => (
                              <SelectItem key={coach.id} value={coach.id}>
                                {coach.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {laneCoach.coachId && (
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PASO 3 - En línea */}
              {allAssigned && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="text-sm font-semibold text-green-900">
                      ¡Todo listo!
                    </span>
                  </div>
                  <Button
                    onClick={handleStartEvent}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-8 px-4 text-sm"
                  >
                    {saving ? (
                      <>Guardando...</>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        Comenzar Evento
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
