"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity } from "lucide-react";

interface Child {
  id: string;
  name: string;
}

interface SwimStyle {
  style: string;
  nameEs: string;
  nameEn: string;
  description?: string;
}

export default function ParentTrainingsAnalysisPage() {

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState("");
  const [styles, setStyles] = useState<SwimStyle[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedDistance, setSelectedDistance] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("Mes");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searching, setSearching] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<string, number | null>>({});
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const analysisRef = React.useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<"filters" | "best" | "detail">("filters");


  useEffect(() => {
    async function fetchChildren() {
      try {
        setLoading(true);
        const res = await fetch("/api/swimmers");
        if (!res.ok) throw new Error("Error al obtener nadadores");
        const data = await res.json();
        setChildren(data);
        if (Array.isArray(data) && data.length > 0) {
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
            const exists = stored && data.some((d: any) => d.id === stored);
            setSelectedChild(exists ? (stored as string) : data[0].id);
          } catch {
            setSelectedChild(data[0].id);
          }
        }
      } catch (err) {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    }
    async function fetchStyles() {
      try {
        const res = await fetch("/api/config/styles");
        if (!res.ok) throw new Error("Error al obtener estilos");
        const data = await res.json();
        setStyles(data);
      } catch (err) {
        setStyles([]);
      }
    }
    fetchChildren();
    fetchStyles();
  }, []);

  // Mantener sincronizada la selección con el resto de la app
  useEffect(() => {
    if (selectedChild) {
      try { localStorage.setItem('selectedChildId', selectedChild); } catch {}
    }
  }, [selectedChild]);

  // Mapeo simple para el origen de datos hacia valores esperados por la API
  function mapSourceToApi(value: string): "COMPETITION" | "TRAINING" | undefined {
    if (!value) return undefined;
    if (value === "COMPETENCIA") return "COMPETITION";
    if (value === "PRACTICA") return "TRAINING";
    return undefined;
  }

  async function onBuscar() {
    try {
      setSearching(true);
      const params = new URLSearchParams();
      const apiSource = mapSourceToApi(selectedSource);
      if (apiSource) params.set("source", apiSource);
      if (selectedChild) params.set("childId", selectedChild);
      // Nota: Por ahora la API de mejores tiempos no filtra por estilo/distancia/fechas.
      // Estos filtros se implementarán en endpoints específicos en siguientes iteraciones.

      const res = await fetch(`/api/parent/best-times?${params.toString()}`);
      if (!res.ok) throw new Error("Error al buscar mejores tiempos");
      const data = await res.json();
      setBestTimes(data?.bestTimes || {});
      setOpenSection("best");
      
      // Scroll suave hacia los resultados
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (e) {
      setBestTimes({});
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Activity className="h-7 w-7 text-blue-600" />
            Análisis Avanzado de Entrenamientos
          </h1>
          <p className="text-gray-600">Analiza y compara el rendimiento de tus nadadores</p>
        </div>

        {/* Acordeón principal: 1) Filtros  2) Mejores tiempos  3) Tiempo (estilo seleccionado) */}
        <Accordion value={openSection} onValueChange={(v) => v && setOpenSection(v as any)} type="single" collapsible className="space-y-4">
          {/* 1. Filtros de búsqueda */}
          <AccordionItem value="filters" className="rounded-xl shadow-md border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50">
            <AccordionTrigger className="flex items-center gap-3 text-left px-4 py-3 font-semibold text-blue-700 hover:bg-blue-100/40 rounded-xl transition-all">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Filtros de búsqueda
              <span className="ml-auto"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Activo</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                {/* Primera fila: Nadador, Fuente, Distancia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="nadador" className="text-sm font-medium">Nadador</Label>
                    <Select value={selectedChild} onValueChange={setSelectedChild} disabled={loading}>
                      <SelectTrigger id="nadador" className="w-full">
                        <SelectValue placeholder={loading ? "Cargando..." : "Selecciona un nadador"} />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map(child => (
                          <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuente" className="text-sm font-medium">Fuente de datos</Label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger id="fuente" className="w-full">
                        <SelectValue placeholder="Todas las fuentes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPETENCIA">🏆 Competencias</SelectItem>
                        <SelectItem value="PRACTICA">🏊 Prácticas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distancia" className="text-sm font-medium">Distancia</Label>
                    <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                      <SelectTrigger id="distancia" className="w-full">
                        <SelectValue placeholder="Todas las distancias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25m</SelectItem>
                        <SelectItem value="50">50m</SelectItem>
                        <SelectItem value="100">100m</SelectItem>
                        <SelectItem value="200">200m</SelectItem>
                        <SelectItem value="400">400m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segunda fila: Rango de fechas + condicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rango" className="text-sm font-medium">Rango de fechas</Label>
                    <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                      <SelectTrigger id="rango" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semana">📅 Semana (Lun-Sáb)</SelectItem>
                        <SelectItem value="Mes">📆 Mes</SelectItem>
                        <SelectItem value="Personalizado">🔧 Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDateRange === "Semana" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="week" className="text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Semana del año (Lunes a Sábado)
                      </Label>
                      <Input id="week" type="week" className="w-full" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} />
                      <p className="text-xs text-gray-600">Los domingos son día de descanso</p>
                    </div>
                  )}

                  {selectedDateRange === "Mes" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="month" className="text-sm font-medium">Mes</Label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger id="month" className="w-full">
                            <SelectValue placeholder="Selecciona un mes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Enero</SelectItem>
                            <SelectItem value="2">Febrero</SelectItem>
                            <SelectItem value="3">Marzo</SelectItem>
                            <SelectItem value="4">Abril</SelectItem>
                            <SelectItem value="5">Mayo</SelectItem>
                            <SelectItem value="6">Junio</SelectItem>
                            <SelectItem value="7">Julio</SelectItem>
                            <SelectItem value="8">Agosto</SelectItem>
                            <SelectItem value="9">Septiembre</SelectItem>
                            <SelectItem value="10">Octubre</SelectItem>
                            <SelectItem value="11">Noviembre</SelectItem>
                            <SelectItem value="12">Diciembre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-medium">Año</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger id="year" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {selectedDateRange === "Personalizado" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium">Fecha inicio</Label>
                        <Input id="startDate" type="date" className="w-full" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium">Fecha fin</Label>
                        <Input id="endDate" type="date" className="w-full" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button onClick={onBuscar} disabled={searching} size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg">
                    {searching ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar entrenamientos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Mejores tiempos por estilo */}
          <AccordionItem value="best">
            <AccordionTrigger className="flex items-center gap-3 text-left px-4 py-3 font-semibold text-green-700 hover:bg-green-100/40 rounded-xl transition-all">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Mejores tiempos por estilo
              <span className="ml-auto"><span className={`bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ${Object.keys(bestTimes).length ? '' : 'opacity-50'}`}>{Object.keys(bestTimes).length ? 'Resultados' : 'Sin datos'}</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <div ref={resultsRef} className="rounded-lg border bg-white p-6 shadow-sm">
                {Object.keys(bestTimes).length === 0 ? (
                  <div className="text-center text-gray-600">No hay resultados aún. Realiza una búsqueda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {styles.map((s) => {
                      const time = bestTimes[s.style];
                      const isSelected = expandedStyle === s.style;
                      return (
                        <div key={s.style}
                             onClick={() => {
                               if (time == null) return;
                               setExpandedStyle(s.style);
                               setOpenSection("detail");
                               setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
                             }}
                             className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              time != null
                                ? isSelected
                                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-500 shadow-lg'
                                  : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 hover:shadow-md hover:border-blue-400'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                             }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{s.nameEs}</p>
                              <p className={`text-2xl font-bold ${time != null ? 'text-blue-700' : 'text-gray-400'}`}>{time != null ? formatSeconds(time) : '—'}</p>
                            </div>
                            <div className={`p-3 rounded-full ${time != null ? 'bg-blue-200' : 'bg-gray-200'}`}>
                              <svg className={`w-6 h-6 ${time != null ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Tiempo (estilo seleccionado) */}
          <AccordionItem value="detail">
            <AccordionTrigger className="flex items-center gap-3 text-left px-4 py-3 font-semibold text-purple-700 hover:bg-purple-100/40 rounded-xl transition-all">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              {(() => {
                const sel = styles.find(st => st.style === expandedStyle);
                return sel ? `Tiempo: ${sel.nameEs}` : 'Tiempo (estilo seleccionado)';
              })()}
              <span className="ml-auto"><span className={`bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full ${expandedStyle ? '' : 'opacity-50'}`}>{expandedStyle ? 'Detalle' : 'Sin selección'}</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <div ref={analysisRef} className="rounded-lg border bg-white p-6 shadow-sm">
                {(() => {
                  const sel = styles.find(st => st.style === expandedStyle);
                  const t = expandedStyle ? bestTimes[expandedStyle] : null;
                  if (!sel || t == null) {
                    return <p className="text-gray-600">Selecciona un estilo en la sección anterior para ver el análisis.</p>;
                  }
                  return (
                    <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Análisis detallado: {sel.nameEs}
                        </CardTitle>
                        <CardDescription>Progresión y estadísticas completas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="stats" className="border-blue-200">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="font-semibold">Estadísticas Generales</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Mejor tiempo</p>
                                  <p className="text-xl font-bold text-blue-700">{formatSeconds(t)}</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Promedio</p>
                                  <p className="text-xl font-bold text-gray-400">—</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Total entrenamientos</p>
                                  <p className="text-xl font-bold text-gray-400">—</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="progression" className="border-blue-200">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className="font-semibold">Progresión Temporal</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-white rounded-lg border border-green-200 p-4 mt-2 text-gray-700">
                                <p className="text-sm">Resumen de progreso sin gráficos.</p>
                                <p className="text-xs text-gray-500">Próximamente: indicadores de tendencia y consistencia.</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="charts" className="border-blue-200">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                                <span className="font-semibold">Gráficos y Análisis</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 mt-2">
                                <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-6 text-center">
                                  <svg className="w-16 h-16 mx-auto text-purple-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                  </svg>
                                  <p className="text-sm font-medium text-gray-600">Gráfico de progresión por día</p>
                                  <p className="text-xs text-gray-500 mt-1">Próximamente: línea de tiempo con mejoras</p>
                                </div>
                                <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-6 text-center">
                                  <svg className="w-16 h-16 mx-auto text-purple-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  <p className="text-sm font-medium text-gray-600">Comparativa por distancia</p>
                                  <p className="text-xs text-gray-500 mt-1">Próximamente: gráficos comparativos</p>
                                </div>
                                <div className="bg-white rounded-lg border-2 border-dashed border-purple-300 p-6 text-center">
                                  <svg className="w-16 h-16 mx-auto text-purple-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                  </svg>
                                  <p className="text-sm font-medium text-gray-600">Distribución de rendimiento</p>
                                  <p className="text-xs text-gray-500 mt-1">Próximamente: análisis de consistencia</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

// Utilidad básica para formatear segundos a mm:ss.cc
function formatSeconds(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const c = Math.round((secs - Math.floor(secs)) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}
