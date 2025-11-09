"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search, Users, Plus, Trash2, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Event {
  id: string;
  title: string;
  style: string;
  distance: number;
}

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
}

interface LaneCoach {
  lane: number;
  coachId: string;
  coachName: string;
}

interface SerieSwimmer {
  lane: number;
  swimmerId: string | null;
  swimmerName?: string;
}

interface Serie {
  number: number;
  swimmers: SerieSwimmer[];
}

export default function SeriesPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [laneCoaches, setLaneCoaches] = useState<LaneCoach[]>([]);
  const [allSwimmers, setAllSwimmers] = useState<Swimmer[]>([]);
  const [usedSwimmerIds, setUsedSwimmerIds] = useState<Set<string>>(new Set());
  const [series, setSeries] = useState<Serie[]>([]);
  const [currentSerie, setCurrentSerie] = useState<Serie>({ number: 1, swimmers: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchLaneCoaches();
      fetchSwimmers();
      fetchExistingSeries();
    }
  }, [eventId]);

  // Inicializar swimmers de la serie actual con los carriles disponibles
  useEffect(() => {
    if (laneCoaches.length > 0 && currentSerie.swimmers.length === 0) {
      const emptySwimmers = laneCoaches.map(lc => ({
        lane: lc.lane,
        swimmerId: null,
      }));
      setCurrentSerie(prev => ({ ...prev, swimmers: emptySwimmers }));
    }
  }, [laneCoaches]);

  async function fetchEventData() {
    try {
      const res = await fetch(`/api/club/events/${eventId}`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      } else {
        toast.error('Error al cargar evento');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    }
  }

  async function fetchLaneCoaches() {
    try {
      const res = await fetch(`/api/club/heats/${eventId}/lane-coaches`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setLaneCoaches(data.laneCoaches || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchSwimmers() {
    try {
      const res = await fetch('/api/club/swimmers', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setAllSwimmers(data.swimmers || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchExistingSeries() {
    try {
      const res = await fetch(`/api/club/heats/${eventId}/series`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setSeries(data.series || []);
        
        // Marcar nadadores usados
        const used = new Set<string>();
        data.series?.forEach((s: Serie) => {
          s.swimmers.forEach(sw => {
            if (sw.swimmerId) used.add(sw.swimmerId);
          });
        });
        setUsedSwimmerIds(used);
        
        // Establecer número de serie actual
        if (data.series && data.series.length > 0) {
          setCurrentSerie({ 
            number: data.series.length + 1, 
            swimmers: laneCoaches.map(lc => ({ lane: lc.lane, swimmerId: null }))
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function assignSwimmer(lane: number, swimmerId: string) {
    const swimmer = allSwimmers.find(s => s.id === swimmerId);
    if (!swimmer) return;

    setCurrentSerie(prev => ({
      ...prev,
      swimmers: prev.swimmers.map(s =>
        s.lane === lane
          ? { ...s, swimmerId, swimmerName: swimmer.name }
          : s
      ),
    }));
    setSearchTerm("");
  }

  function removeSwimmer(lane: number) {
    setCurrentSerie(prev => ({
      ...prev,
      swimmers: prev.swimmers.map(s =>
        s.lane === lane
          ? { ...s, swimmerId: null, swimmerName: undefined }
          : s
      ),
    }));
  }

  async function handleSaveSerie() {
    // Validar que al menos un carril tenga nadador
    const assignedCount = currentSerie.swimmers.filter(s => s.swimmerId).length;
    
    if (assignedCount === 0) {
      toast.error('Debes asignar al menos un nadador a la serie');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/club/heats/${eventId}/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ serie: currentSerie }),
      });

      if (res.ok) {
        toast.success(`✅ Serie ${currentSerie.number} guardada correctamente`);
        
        // Agregar serie a la lista
        setSeries(prev => [...prev, currentSerie]);
        
        // Marcar nadadores como usados
        currentSerie.swimmers.forEach(s => {
          if (s.swimmerId) {
            setUsedSwimmerIds(prev => new Set([...prev, s.swimmerId!]));
          }
        });
        
        // Preparar siguiente serie
        setCurrentSerie({
          number: currentSerie.number + 1,
          swimmers: laneCoaches.map(lc => ({ lane: lc.lane, swimmerId: null })),
        });
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Error al guardar serie');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    } finally {
      setSaving(false);
    }
  }

  function handleStartCompetition() {
    if (series.length === 0) {
      toast.error('Debes crear al menos una serie antes de iniciar');
      return;
    }
    
    // Redirigir a la página de control/cronometraje
    router.push(`/club/competencias/${eventId}/control`);
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

  // Filtrar nadadores disponibles
  const availableSwimmers = allSwimmers.filter(swimmer => {
    // Excluir nadadores ya usados en series anteriores
    if (usedSwimmerIds.has(swimmer.id)) return false;
    
    // Excluir nadadores ya asignados en la serie actual
    if (currentSerie.swimmers.some(s => s.swimmerId === swimmer.id)) return false;
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      return swimmer.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

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

  if (!event || laneCoaches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pt-12 text-center">
        <p className="text-gray-600">
          {!event ? 'Evento no encontrado' : 'No hay carriles configurados'}
        </p>
        <Button 
          onClick={() => router.push(`/club/competencias/${eventId}/assign`)} 
          className="mt-4"
        >
          Configurar Carriles
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 pb-12">
      {/* Header */}
      <div>
        <Link
          href={`/club/competencias/${eventId}/assign`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Configuración
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Gestionar Series
        </h1>
        <p className="text-gray-600 mt-2">
          {event.title} • {event.distance}m {getStyleName(event.style)} • {laneCoaches.length} carriles
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Izquierda - Serie Actual */}
        <div className="lg:col-span-2 space-y-6">
          {/* Serie Actual */}
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
                  {currentSerie.number}
                </span>
                Serie {currentSerie.number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Carriles */}
              {currentSerie.swimmers.map((sw) => {
                const laneCoach = laneCoaches.find(lc => lc.lane === sw.lane);
                
                return (
                  <div
                    key={sw.lane}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      sw.swimmerId 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                          {sw.lane}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {sw.swimmerName || 'Sin asignar'}
                          </p>
                          <p className="text-xs text-gray-600">
                            Profesor: {laneCoach?.coachName}
                          </p>
                        </div>
                      </div>
                      {sw.swimmerId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSwimmer(sw.lane)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Botón Guardar Serie */}
              <Button
                onClick={handleSaveSerie}
                disabled={saving || currentSerie.swimmers.every(s => !s.swimmerId)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardar Serie {currentSerie.number}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Series Guardadas */}
          {series.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Series Guardadas ({series.length})
              </h3>
              {series.map((serie) => (
                <Card key={serie.number} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {serie.number}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Serie {serie.number}</p>
                        <p className="text-xs text-gray-600">
                          {serie.swimmers.filter(s => s.swimmerId).length} nadadores
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Botón Iniciar Competencia */}
          {series.length > 0 && (
            <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <Button
                  onClick={handleStartCompetition}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-14 text-lg font-semibold"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Iniciar Cronometraje
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha - Buscador de Nadadores */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-purple-300 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-lg">Buscar Nadador</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Lista de Nadadores Disponibles */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {availableSwimmers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    {searchTerm 
                      ? 'No se encontraron nadadores' 
                      : 'No hay nadadores disponibles'}
                  </p>
                ) : (
                  availableSwimmers.map((swimmer) => {
                    const age = new Date().getFullYear() - new Date(swimmer.birthDate).getFullYear();
                    const hasSpace = currentSerie.swimmers.some(s => !s.swimmerId);
                    
                    return (
                      <div
                        key={swimmer.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => {
                          if (!hasSpace) {
                            toast.error('Todos los carriles están ocupados');
                            return;
                          }
                          // Asignar al primer carril disponible
                          const firstEmpty = currentSerie.swimmers.find(s => !s.swimmerId);
                          if (firstEmpty) {
                            assignSwimmer(firstEmpty.lane, swimmer.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {swimmer.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {age} años
                            </p>
                          </div>
                          <Plus className="h-5 w-5 text-blue-600 shrink-0" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Contador */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold">{availableSwimmers.length}</span> nadadores disponibles
                  <br />
                  <span className="font-semibold">{usedSwimmerIds.size}</span> ya compitieron
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
