"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, Calendar, MapPin, Download, ChevronDown } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Swimmer {
  id: string;
  name: string;
}

interface Result {
  position: number;
  swimmer: Swimmer;
  time: number;
  heatNumber: number;
  laneNumber: number;
}

interface Category {
  code: string;
  categoryCode: string;
  gender: string;
  name: string;
  results: Result[];
}

interface Event {
  id: string;
  title: string;
  distance: number;
  style: string;
  startDate: string;
  location: string | null;
}

interface ResultsData {
  event: Event;
  categories: Category[];
}

export default function CompetenciaResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id: eventId } = resolvedParams;

  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [eventId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/club/events/${eventId}/results`);
      if (response.ok) {
        const resultData = await response.json();
        setData(resultData);
      } else {
        toast.error("Error al cargar resultados");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getStyleName = (style: string) => {
    const styles: Record<string, string> = {
      FREESTYLE: "Libre",
      BACKSTROKE: "Espalda",
      BREASTSTROKE: "Pecho",
      BUTTERFLY: "Mariposa",
      INDIVIDUAL_MEDLEY: "Combinado",
    };
    return styles[style] || style;
  };

  const getMedalEmoji = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "";
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return "bg-yellow-100 border-yellow-400 text-yellow-900";
    if (position === 2) return "bg-gray-100 border-gray-400 text-gray-900";
    if (position === 3) return "bg-orange-100 border-orange-400 text-orange-900";
    return "bg-white border-gray-200 text-gray-900";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron resultados</p>
          <Link href="/club/competencias">
            <Button className="mt-4">Volver a Competencias</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/club/competencias"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Competencias
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <Trophy className="w-10 h-10 text-yellow-500" />
                Resultados
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                {data.event.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(data.event.startDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {data.event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{data.event.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Imprimir Resultados
            </Button>
          </div>
        </div>

        {/* Resultados por Categoría */}
        {data.categories.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay resultados disponibles
              </h3>
              <p className="text-gray-500">
                Los resultados aparecerán aquí cuando los nadadores completen sus pruebas
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={Array.from(new Set(data.categories.map(cat => cat.categoryCode)))[0]} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-center gap-2 h-auto p-2 bg-white border-2 border-gray-200 rounded-lg">
              {/* Agrupar por categoría base (sin género) */}
              {(() => {
                // Orden estándar de categorías
                const categoryOrder = [
                  'pre_minima',
                  'minima_1',
                  'minima_2',
                  'infantil_a1',
                  'infantil_a2',
                  'infantil_b1',
                  'infantil_b2',
                  'juvenil_a',
                  'juvenil_b',
                  'juvenil_c',
                  'junior',
                  'senior',
                  'master'
                ];
                
                // Obtener categorías únicas
                const uniqueCategories = Array.from(
                  new Set(data.categories.map(cat => cat.categoryCode))
                );
                
                // Ordenar según el orden estándar
                const sortedCategories = uniqueCategories.sort((a, b) => {
                  const indexA = categoryOrder.indexOf(a);
                  const indexB = categoryOrder.indexOf(b);
                  // Si no está en el orden, poner al final
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });
                
                return sortedCategories.map((categoryCode) => {
                  // Obtener el nombre limpio de la categoría (sin el sufijo de género)
                  const categoryInfo = [
                    { code: 'pre_minima', name: 'PRE-MÍNIMA' },
                    { code: 'minima_1', name: 'MÍNIMA 1' },
                    { code: 'minima_2', name: 'MÍNIMA 2' },
                    { code: 'infantil_a1', name: 'INFANTIL A1' },
                    { code: 'infantil_a2', name: 'INFANTIL A2' },
                    { code: 'infantil_b1', name: 'INFANTIL B1' },
                    { code: 'infantil_b2', name: 'INFANTIL B2' },
                    { code: 'juvenil_a', name: 'JUVENIL A' },
                    { code: 'juvenil_b', name: 'JUVENIL B' },
                    { code: 'juvenil_c', name: 'JUVENIL C' },
                    { code: 'junior', name: 'JUNIOR' },
                    { code: 'senior', name: 'SENIOR' },
                    { code: 'master', name: 'MASTER' },
                  ].find(c => c.code === categoryCode);
                  
                  const categoryName = categoryInfo?.name || categoryCode.toUpperCase();
                  
                  return (
                    <TabsTrigger 
                      key={categoryCode} 
                      value={categoryCode}
                      className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{categoryName}</span>
                        <span className="text-xs opacity-80">
                          {data.event.distance}m {getStyleName(data.event.style)}
                        </span>
                      </div>
                    </TabsTrigger>
                  );
                });
              })()}
            </TabsList>

            {/* Contenido de cada categoría */}
            {(() => {
              // Orden estándar de categorías
              const categoryOrder = [
                'pre_minima',
                'minima_1',
                'minima_2',
                'infantil_a1',
                'infantil_a2',
                'infantil_b1',
                'infantil_b2',
                'juvenil_a',
                'juvenil_b',
                'juvenil_c',
                'junior',
                'senior',
                'master'
              ];
              
              const uniqueCategories = Array.from(
                new Set(data.categories.map(cat => cat.categoryCode))
              );
              
              // Ordenar según el orden estándar
              const sortedCategories = uniqueCategories.sort((a, b) => {
                const indexA = categoryOrder.indexOf(a);
                const indexB = categoryOrder.indexOf(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              });
              
              return sortedCategories.map((categoryCode) => {
                // Encontrar todas las categorías con este código
                const categoriesWithCode = data.categories.filter(c => c.categoryCode === categoryCode);
                const damas = categoriesWithCode.find(c => c.gender === 'FEMALE');
                const varones = categoriesWithCode.find(c => c.gender === 'MALE');
                
                return (
                  <TabsContent key={categoryCode} value={categoryCode} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* VARONES */}
                      {varones && (
                        <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                          <div className="bg-blue-600 text-white px-4 py-3">
                            <h3 className="text-center font-bold text-lg">VARONES</h3>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="space-y-2">
                              {varones.results.map((result) => (
                                <div
                                  key={`${result.swimmer.id}-${result.heatNumber}-${result.laneNumber}`}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${getPositionColor(result.position)}`}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0">
                                      <span className="text-base font-bold">
                                        {getMedalEmoji(result.position) || result.position}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold truncate">
                                        {result.swimmer.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Serie {result.heatNumber} • Carril {result.laneNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-3">
                                    <p className="text-lg font-bold font-mono">
                                      {formatTime(result.time)}
                                    </p>
                                    {result.position <= 3 && (
                                      <p className="text-xs font-semibold">
                                        {result.position === 1 ? "ORO" : result.position === 2 ? "PLATA" : "BRONCE"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DAMAS */}
                      {damas && (
                        <div className="border-2 border-pink-200 rounded-lg overflow-hidden">
                          <div className="bg-pink-600 text-white px-4 py-3">
                            <h3 className="text-center font-bold text-lg">DAMAS</h3>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="space-y-2">
                              {damas.results.map((result) => (
                                <div
                                  key={`${result.swimmer.id}-${result.heatNumber}-${result.laneNumber}`}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${getPositionColor(result.position)}`}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0">
                                      <span className="text-base font-bold">
                                        {getMedalEmoji(result.position) || result.position}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold truncate">
                                        {result.swimmer.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Serie {result.heatNumber} • Carril {result.laneNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-3">
                                    <p className="text-lg font-bold font-mono">
                                      {formatTime(result.time)}
                                    </p>
                                    {result.position <= 3 && (
                                      <p className="text-xs font-semibold">
                                        {result.position === 1 ? "ORO" : result.position === 2 ? "PLATA" : "BRONCE"}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!damas && !varones && (
                        <Card className="col-span-full border-2 border-gray-200">
                          <CardContent className="p-8 text-center">
                            <p className="text-gray-500">Sin resultados disponibles</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                );
              });
            })()}
          </Tabs>
        )}
      </div>
    </div>
  );
}
