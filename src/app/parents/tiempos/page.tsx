"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// Componente de Card con efecto Flip
function MetricCard({ 
  emoji, 
  badge, 
  title, 
  value, 
  subtitle, 
  explanation,
  aiSummary,
  gradient,
  borderColor,
  textColor,
  badgeColor 
}: {
  emoji: string;
  badge: string;
  title: string;
  value: string | React.ReactNode;
  subtitle: string;
  explanation: string;
  aiSummary: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
}) {
  const [flippedState, setFlippedState] = useState<'front' | 'explanation' | 'ai'>('front');

  const handleIconClick = (e: React.MouseEvent, type: 'explanation' | 'ai') => {
    e.stopPropagation();
    setFlippedState(type);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedState('front');
  };

  return (
    <div 
      className="relative h-48"
      style={{ perspective: '1000px' }}
    >
      <div 
        className={`absolute w-full h-full transition-transform duration-500`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: flippedState !== 'front' ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* FRENTE */}
        <div 
          className={`absolute w-full h-full bg-gradient-to-br ${gradient} rounded-xl border-2 ${borderColor} p-6 shadow-lg hover:shadow-xl transition-shadow`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{emoji}</span>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-semibold ${badgeColor} px-2 py-1 rounded-full`}>{badge}</span>
              <button 
                onClick={(e) => handleIconClick(e, 'explanation')}
                className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md text-sm hover:scale-110 transition-transform cursor-pointer"
              >
                💡
              </button>
              <button 
                onClick={(e) => handleIconClick(e, 'ai')}
                className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md text-sm hover:scale-110 transition-transform cursor-pointer"
              >
                ✨
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <div className={`text-4xl font-bold ${textColor} mb-2`}>
            {value}
          </div>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        {/* REVERSO - Explicación */}
        {flippedState === 'explanation' && (
          <div 
            className={`absolute w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 p-5 shadow-lg cursor-pointer`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            onClick={handleBackClick}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-lg">💡</span>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Explicación</span>
              </div>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">Click para volver</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{title}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* REVERSO - AI */}
        {flippedState === 'ai' && (
          <div 
            className={`absolute w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl border-2 border-purple-300 p-5 shadow-lg cursor-pointer`}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            onClick={handleBackClick}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-lg">✨</span>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Análisis AI</span>
              </div>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">Click para volver</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{title}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentTrainingsAnalysisPage() {

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState("");
  const [styles, setStyles] = useState<SwimStyle[]>([]);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("25");
  const [selectedDateRange, setSelectedDateRange] = useState("Mes");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searching, setSearching] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<string, number | null>>({});
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const analysisRef = React.useRef<HTMLDivElement>(null);
  const [openSection, setOpenSection] = useState<"filters" | "best" | "detail">("filters");
  const [poolType, setPoolType] = useState("SHORT_25M");
  const [poolTypes, setPoolTypes] = useState<any[]>([]);


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
    async function fetchPoolTypes() {
      try {
        const res = await fetch("/api/config");
        if (!res.ok) throw new Error("Error al obtener tipos de piscina");
        const data = await res.json();
        setPoolTypes(data.pools || []);
      } catch (err) {
        setPoolTypes([]);
      }
    }
    fetchChildren();
    fetchStyles();
    fetchPoolTypes();
  }, []);

  // Mantener sincronizada la selección con el resto de la app
  useEffect(() => {
    if (selectedChild) {
      try { localStorage.setItem('selectedChildId', selectedChild); } catch {}
    }
  }, [selectedChild]);

  // Recargar resultados cuando cambie el tipo de piscina
  useEffect(() => {
    if (Object.keys(bestTimes).length > 0 && selectedChild && selectedDistance) {
      onBuscar();
    }
  }, [poolType]);

  async function onBuscar() {
    // Validación: nadador y distancia son obligatorios
    if (!selectedChild) {
      alert("Por favor selecciona un nadador");
      return;
    }
    if (!selectedDistance) {
      alert("Por favor selecciona una distancia");
      return;
    }

    try {
      setSearching(true);
      const params = new URLSearchParams();
      params.set("childId", selectedChild);
      params.set("distance", selectedDistance);
      if (poolType) {
        params.set("poolType", poolType);
      }
      // Solo agregar source si hay una fuente específica seleccionada (no vacío ni "all")
      if (selectedSource && selectedSource !== "" && selectedSource !== "all") {
        params.set("source", selectedSource);
      }
      // Nota: Si no se especifica source, la API busca en TODAS las fuentes (Entrenamientos, Competencias, Competencias Internas)

      const res = await fetch(`/api/parent/best-times?${params.toString()}`);
      if (!res.ok) throw new Error("Error al buscar mejores tiempos");
      const data = await res.json();
      const newBestTimes = data?.bestTimes || {};
      setBestTimes(newBestTimes);
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

        {/* Resumen de filtros aplicados - Siempre visible cuando hay resultados */}
        {(selectedChild || selectedDistance || selectedSource) && Object.keys(bestTimes).length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros aplicados:
              </h3>
              {selectedChild && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-700">
                    {children.find(c => c.id === selectedChild)?.name || 'Nadador'}
                  </span>
                </span>
              )}
              {selectedDistance && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium text-gray-700">{selectedDistance}m</span>
                </span>
              )}
              {poolType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-medium text-gray-700">
                    {poolTypes.find(p => p.poolSize === poolType)?.nameEs || poolType}
                  </span>
                </span>
              )}
              {selectedSource && selectedSource !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  {selectedSource === 'COMPETITION' ? '🏆' : selectedSource === 'TRAINING' ? '🏊' : '⏱️'}
                  <span className="font-medium text-gray-700">
                    {selectedSource === 'COMPETITION' ? 'Competencias' : selectedSource === 'TRAINING' ? 'Entrenamientos' : 'Comp. Internas'}
                  </span>
                </span>
              )}
              {selectedDateRange === 'Mes' && selectedMonth && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-gray-700">
                    {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(selectedMonth) - 1]} {selectedYear}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

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
                {/* Primera fila: Nadador, Distancia, Fuente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="nadador" className="text-sm font-medium">
                      Nadador <span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="distancia" className="text-sm font-medium">
                      Distancia <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                      <SelectTrigger id="distancia" className="w-full">
                        <SelectValue placeholder="Selecciona distancia" />
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

                  <div className="space-y-2">
                    <Label htmlFor="fuente" className="text-sm font-medium">Fuente de datos</Label>
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger id="fuente" className="w-full">
                        <SelectValue placeholder="Todas las fuentes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📊 Todas las fuentes</SelectItem>
                        <SelectItem value="COMPETITION">🏆 Competencias</SelectItem>
                        <SelectItem value="TRAINING">🏊 Entrenamientos</SelectItem>
                        <SelectItem value="INTERNAL_COMPETITION">⏱️ Competencias Internas</SelectItem>
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
                  <Button 
                    onClick={onBuscar} 
                    disabled={searching || !selectedChild || !selectedDistance} 
                    size="lg" 
                    className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Buscar tiempos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Mejores tiempos por estilo */}
          <AccordionItem value="best" className="rounded-xl shadow-md border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <AccordionTrigger className="flex items-center gap-3 text-left px-4 py-3 font-semibold text-green-700 hover:bg-green-100/40 rounded-xl transition-all">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Mejores tiempos por estilo
              <span className="ml-auto"><span className={`bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ${styles.some(s => bestTimes[s.style] != null) ? '' : 'opacity-50'}`}>{styles.some(s => bestTimes[s.style] != null) ? 'Resultados' : 'Sin datos'}</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <div ref={resultsRef} className="rounded-lg border bg-white p-6 shadow-sm">
                {/* Tabs para Tipo de Piscina */}
                {poolTypes.length > 0 && Object.keys(bestTimes).length > 0 && (
                  <div className="mb-6">
                    <Tabs value={poolType} onValueChange={setPoolType} className="w-full">
                      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${poolTypes.length}, 1fr)` }}>
                        {poolTypes.map((pool) => (
                          <TabsTrigger key={pool.poolSize} value={pool.poolSize} className="text-sm sm:text-base">
                            {pool.nameEs}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}
                
                {styles.length === 0 || styles.every(s => bestTimes[s.style] == null) ? (
                  <div className="text-center text-gray-600">No hay resultados aún. Realiza una búsqueda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {styles.map((s) => {
                      const time = bestTimes[s.style];
                      const source = bestTimes[`${s.style}_source`];
                      const bestDate = bestTimes[`${s.style}_bestDate`];
                      const competitionName = bestTimes[`${s.style}_competitionName`];
                      const isSelected = expandedStyle === s.style;
                      
                      // Mapear fuente a etiqueta legible
                      const getSourceLabel = (src: string | number) => {
                        const sourceStr = String(src);
                        switch(sourceStr) {
                          case 'COMPETITION': return '🏆 Competencia';
                          case 'TRAINING': return '🏊 Entrenamiento';
                          case 'INTERNAL_COMPETITION': return '⏱️ Comp. Interna';
                          default: return '';
                        }
                      };
                      
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-600">{s.nameEs}</p>
                              <p className={`text-2xl font-bold ${time != null ? 'text-blue-700' : 'text-gray-400'}`}>{time != null ? formatSeconds(time) : '—'}</p>
                              {time != null && (source || bestDate || competitionName) && (
                                <div className="mt-1 space-y-0.5">
                                  {source && (
                                    <p className="text-xs text-gray-500">{getSourceLabel(source)}</p>
                                  )}
                                  {competitionName && String(source) === 'COMPETITION' && (
                                    <p className="text-xs font-semibold text-blue-600 truncate" title={String(competitionName)}>
                                      📋 {String(competitionName)}
                                    </p>
                                  )}
                                  {bestDate && (
                                    <p className="text-xs text-gray-500">
                                      📅 {new Date(String(bestDate)).toLocaleDateString('es-ES', { 
                                        day: '2-digit', 
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center flex-shrink-0 w-16">
                              <img 
                                src={`/estilos/${
                                  s.style === 'FREESTYLE' ? 'libre.png' :
                                  s.style === 'BACKSTROKE' ? 'espalda.png' :
                                  s.style === 'BREASTSTROKE' ? 'pecho.png' :
                                  s.style === 'BUTTERFLY' ? 'mariposa.png' :
                                  s.style === 'INDIVIDUAL_MEDLEY' ? 'combinado.png' :
                                  'libre.png'
                                }`}
                                alt={s.nameEs}
                                className={`w-14 h-14 object-contain ${time == null ? 'opacity-40 grayscale' : ''}`}
                              />
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
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Mejor tiempo</p>
                                  <p className="text-xl font-bold text-blue-700">{formatSeconds(t)}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {bestTimes[`${expandedStyle}_bestDate`] ? new Date(String(bestTimes[`${expandedStyle}_bestDate`])).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Último tiempo</p>
                                  <p className="text-xl font-bold text-gray-700">
                                    {bestTimes[`${expandedStyle}_lastTime`] && typeof bestTimes[`${expandedStyle}_lastTime`] === 'number' ? formatSeconds(bestTimes[`${expandedStyle}_lastTime`] as number) : '—'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {bestTimes[`${expandedStyle}_lastDate`] ? new Date(String(bestTimes[`${expandedStyle}_lastDate`])).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                                  <p className="text-xs text-gray-600 mb-1">Tendencia</p>
                                  {(() => {
                                    const lastTime = bestTimes[`${expandedStyle}_lastTime`];
                                    if (!lastTime || lastTime === t) {
                                      return <p className="text-xl font-bold text-gray-400">—</p>;
                                    }
                                    const diff = lastTime - t;
                                    const improving = diff > 0;
                                    return (
                                      <>
                                        <p className={`text-xl font-bold ${improving ? 'text-red-600' : 'text-green-600'}`}>
                                          {improving ? '⬇️' : '⬆️'} {Math.abs(diff).toFixed(2)}s
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {improving ? 'Bajó' : 'Mejoró'}
                                        </p>
                                      </>
                                    );
                                  })()}
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
                              <div className="bg-white rounded-lg border border-green-200 p-4 mt-2">
                                {(() => {
                                  const allTimes = (bestTimes[`${expandedStyle}_allTimes`] || []) as Array<{time: number, date: string}>;
                                  if (allTimes.length === 0) {
                                    return <p className="text-sm text-gray-500">No hay suficientes datos para mostrar progresión.</p>;
                                  }
                                  
                                  // Determinar el mes y año actual de la búsqueda
                                  const currentMonth = parseInt(selectedMonth);
                                  const currentYear = parseInt(selectedYear);
                                  
                                  // Crear las 5 semanas del mes
                                  const weeks = [];
                                  for (let weekNum = 1; weekNum <= 5; weekNum++) {
                                    // Calcular rango de fechas para cada semana
                                    // Semana 1: días 1-7, Semana 2: días 8-14, etc.
                                    const startDay = (weekNum - 1) * 7 + 1;
                                    const endDay = Math.min(weekNum * 7, new Date(currentYear, currentMonth, 0).getDate());
                                    
                                    const weekStart = new Date(currentYear, currentMonth - 1, startDay, 0, 0, 0, 0);
                                    const weekEnd = new Date(currentYear, currentMonth - 1, endDay, 23, 59, 59, 999);
                                    
                                    // Filtrar tiempos de esta semana
                                    const weekTimes = allTimes.filter((entry: any) => {
                                      const entryDate = new Date(entry.date);
                                      return entryDate >= weekStart && entryDate <= weekEnd;
                                    });
                                    
                                    const bestTime = weekTimes.length > 0 
                                      ? Math.min(...weekTimes.map((e: any) => e.time))
                                      : null;
                                    
                                    // Formatear rango de fechas para el label
                                    const dateRange = `${startDay}-${endDay} ${new Date(currentYear, currentMonth - 1).toLocaleDateString('es-ES', { month: 'short' })}`;
                                    
                                    weeks.push({
                                      label: `Semana ${weekNum}`,
                                      dateRange,
                                      bestTime,
                                      count: weekTimes.length
                                    });
                                    
                                    // Si llegamos al último día del mes, terminar
                                    if (endDay >= new Date(currentYear, currentMonth, 0).getDate()) break;
                                  }
                                  
                                  return (
                                    <div className="space-y-2">
                                      {weeks.map((week, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                          <div className="w-32">
                                            <span className="text-sm font-medium text-gray-600 block">{week.label}</span>
                                            <span className="text-xs text-gray-500">{week.dateRange}</span>
                                          </div>
                                          <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                                            {week.bestTime ? (
                                              <>
                                                <div 
                                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full flex items-center justify-end px-3 transition-all"
                                                  style={{ width: `${Math.min(100, (week.bestTime / (t * 1.5)) * 100)}%` }}
                                                >
                                                  <span className="text-xs font-bold text-white">{formatSeconds(week.bestTime)}</span>
                                                </div>
                                              </>
                                            ) : (
                                              <div className="h-full flex items-center justify-center">
                                                <span className="text-xs text-gray-400">Sin datos</span>
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-xs text-gray-500 w-16">{week.count} reg.</span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="charts" className="border-blue-200">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="font-semibold">Análisis de Rendimiento</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="mt-2">
                                {/* Encabezado informativo */}
                                <div className="mb-4 flex items-center gap-3 text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xl">💡</span>
                                    <span className="text-xl">✨</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Click en cada tarjeta</span> para ver explicación y análisis AI
                                  </div>
                                </div>
                                
                                {/* Grid 3x3 de indicadores */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  
                                  {/* 1. PB (Personal Best) */}
                                  <MetricCard
                                    emoji="⭐"
                                    badge="PB"
                                    title="Mejor Marca Personal"
                                    value={bestTimes[expandedStyle!] != null ? formatSeconds(bestTimes[expandedStyle!] as number) : '—'}
                                    subtitle={bestTimes[`${expandedStyle}_bestDate`] ? new Date(String(bestTimes[`${expandedStyle}_bestDate`])).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin registro'}
                                    explanation="Es el mejor tiempo que tu hijo ha logrado en toda su historia nadando este estilo. Es su récord personal que busca superar constantemente."
                                    aiSummary={(() => {
                                      const pb = bestTimes[expandedStyle!];
                                      const pbDate = bestTimes[`${expandedStyle}_bestDate`];
                                      const childName = children.find(c => c.id === selectedChild)?.name || 'Tu hijo/a';
                                      if (pb == null) return 'No hay registro de marca personal aún.';
                                      const daysSince = pbDate ? Math.floor((new Date().getTime() - new Date(String(pbDate)).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                                      return `${childName} logró su mejor tiempo de ${formatSeconds(pb)} hace ${daysSince} días. Esta es su meta a superar en cada entrenamiento y competencia. ¡Es el tiempo que define su nivel actual!`;
                                    })()}
                                    gradient="from-yellow-50 to-amber-50"
                                    borderColor="border-yellow-300"
                                    textColor="text-yellow-700"
                                    badgeColor="text-yellow-700 bg-yellow-100"
                                  />

                                  {/* 2. SB (Season Best) */}
                                  <MetricCard
                                    emoji="🏆"
                                    badge="SB"
                                    title="Mejor del Año"
                                    value={bestTimes[`${expandedStyle}_seasonBest`] != null ? formatSeconds(bestTimes[`${expandedStyle}_seasonBest`] as number) : '—'}
                                    subtitle={bestTimes[`${expandedStyle}_seasonBestDate`] ? new Date(String(bestTimes[`${expandedStyle}_seasonBestDate`])).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin registro este año'}
                                    explanation="Es el mejor tiempo de este año calendario. Se renueva cada enero y muestra el progreso de la temporada actual."
                                    aiSummary={(() => {
                                      const sb = bestTimes[`${expandedStyle}_seasonBest`];
                                      const pb = bestTimes[expandedStyle!];
                                      if (sb == null) return 'Aún no hay registro este año.';
                                      const diff = pb != null ? sb - pb : 0;
                                      if (diff === 0) return `¡Excelente! El mejor tiempo del año (${formatSeconds(sb)}) es igual a su récord personal.`;
                                      else if (diff > 0) return `Este año su mejor marca es ${formatSeconds(sb)}, está a ${diff.toFixed(2)}s de su récord histórico. ¡Cada entrenamiento lo acerca más!`;
                                      else return `¡Increíble! Este año superó su récord anterior por ${Math.abs(diff).toFixed(2)}s con un tiempo de ${formatSeconds(sb)}.`;
                                    })()}
                                    gradient="from-blue-50 to-cyan-50"
                                    borderColor="border-blue-300"
                                    textColor="text-blue-700"
                                    badgeColor="text-blue-700 bg-blue-100"
                                  />

                                  {/* 3. Último tiempo */}
                                  <MetricCard
                                    emoji="📅"
                                    badge="ÚLTIMO"
                                    title="Último Tiempo"
                                    value={bestTimes[`${expandedStyle}_lastTime`] != null ? formatSeconds(bestTimes[`${expandedStyle}_lastTime`] as number) : '—'}
                                    subtitle={bestTimes[`${expandedStyle}_lastDate`] ? new Date(String(bestTimes[`${expandedStyle}_lastDate`])).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin registro'}
                                    explanation="El tiempo más reciente registrado en entrenamientos o competencias. Muestra el rendimiento actual y permite comparar con marcas anteriores."
                                    aiSummary={(() => {
                                      const last = bestTimes[`${expandedStyle}_lastTime`];
                                      const lastDate = bestTimes[`${expandedStyle}_lastDate`];
                                      const pb = bestTimes[expandedStyle!];
                                      if (last == null) return 'No hay registros recientes.';
                                      const daysAgo = lastDate ? Math.floor((new Date().getTime() - new Date(String(lastDate)).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                                      const status = pb != null && last <= pb ? '¡Excelente rendimiento!' : 'Rendimiento reciente';
                                      return `${status} Hace ${daysAgo} días nadó ${formatSeconds(last)}. Este es el dato más actualizado de su desempeño.`;
                                    })()}
                                    gradient="from-purple-50 to-pink-50"
                                    borderColor="border-purple-300"
                                    textColor="text-purple-700"
                                    badgeColor="text-purple-700 bg-purple-100"
                                  />

                                  {/* 4. Delta vs PB */}
                                  <MetricCard
                                    emoji="📈"
                                    badge="vs PB"
                                    title="Delta vs PB"
                                    value={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsPB`];
                                      if (delta == null) return '—';
                                      const improving = delta > 0;
                                      return (
                                        <span className={improving ? 'text-red-600' : 'text-green-600'}>
                                          {improving ? '+' : ''}{delta.toFixed(2)}s
                                        </span>
                                      );
                                    })()}
                                    subtitle={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsPB`];
                                      if (delta == null) return '';
                                      return delta > 0 ? '⬆️ Más lento que PB' : '⬇️ Igualó o superó PB';
                                    })()}
                                    explanation="Diferencia entre el último tiempo y su mejor marca personal. Un número negativo indica que está mejorando. Positivo significa que nadó más lento que su récord."
                                    aiSummary={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsPB`];
                                      if (delta == null) return 'No hay suficiente información para calcular.';
                                      if (delta === 0) return '¡Perfecto! Acaba de igualar su mejor marca personal. Está en su mejor nivel.';
                                      else if (delta < 0) return `¡Fenomenal! Superó su récord por ${Math.abs(delta).toFixed(2)}s. Está mejorando constantemente.`;
                                      else return `Está ${delta.toFixed(2)}s más lento que su récord. Es normal tener variaciones, ¡la consistencia es clave para volver al mejor nivel!`;
                                    })()}
                                    gradient="from-emerald-50 to-teal-50"
                                    borderColor="border-emerald-300"
                                    textColor="text-emerald-700"
                                    badgeColor="text-emerald-700 bg-emerald-100"
                                  />

                                  {/* 5. Delta vs SB */}
                                  <MetricCard
                                    emoji="📊"
                                    badge="vs SB"
                                    title="Delta vs SB"
                                    value={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsSB`];
                                      if (delta == null) return '—';
                                      const improving = delta > 0;
                                      return (
                                        <span className={improving ? 'text-red-600' : 'text-green-600'}>
                                          {improving ? '+' : ''}{delta.toFixed(2)}s
                                        </span>
                                      );
                                    })()}
                                    subtitle={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsSB`];
                                      if (delta == null) return '';
                                      return delta > 0 ? '⬆️ Más lento que SB' : '⬇️ Igualó o superó SB';
                                    })()}
                                    explanation="Diferencia con el mejor tiempo del año. Muestra qué tan cerca está de su mejor marca de la temporada actual."
                                    aiSummary={(() => {
                                      const delta = bestTimes[`${expandedStyle}_deltaVsSB`];
                                      if (delta == null) return 'No hay datos de este año aún.';
                                      if (delta === 0) return '¡Está en su mejor nivel del año! Cada entrenamiento mantiene su rendimiento óptimo.';
                                      else if (delta < 0) return `¡Increíble! Superó su mejor marca del año por ${Math.abs(delta).toFixed(2)}s. La temporada va excelente.`;
                                      else return `Está ${delta.toFixed(2)}s de su mejor tiempo este año. Con entrenamiento constante puede alcanzarlo pronto.`;
                                    })()}
                                    gradient="from-orange-50 to-amber-50"
                                    borderColor="border-orange-300"
                                    textColor="text-orange-700"
                                    badgeColor="text-orange-700 bg-orange-100"
                                  />

                                  {/* 6. Promedio últimos 5 */}
                                  <MetricCard
                                    emoji="📊"
                                    badge="AVG 5"
                                    title="Promedio últimos 5"
                                    value={bestTimes[`${expandedStyle}_avg5`] != null ? formatSeconds(bestTimes[`${expandedStyle}_avg5`] as number) : '—'}
                                    subtitle="Registros recientes"
                                    explanation="Promedio de los últimos 5 tiempos registrados. Indica el nivel de rendimiento actual, eliminando variaciones puntuales."
                                    aiSummary={(() => {
                                      const avg = bestTimes[`${expandedStyle}_avg5`];
                                      const pb = bestTimes[expandedStyle!];
                                      if (avg == null) return 'Se necesitan más registros para calcular el promedio.';
                                      const diff = pb != null ? avg - pb : 0;
                                      if (diff <= 1) return `Promedio de ${formatSeconds(avg)}. ¡Muy cerca del récord! Está entrenando a un nivel muy alto y consistente.`;
                                      else return `Promedio de ${formatSeconds(avg)} en los últimos 5 registros. Con ${diff.toFixed(2)}s de diferencia del récord, hay margen de mejora.`;
                                    })()}
                                    gradient="from-indigo-50 to-blue-50"
                                    borderColor="border-indigo-300"
                                    textColor="text-indigo-700"
                                    badgeColor="text-indigo-700 bg-indigo-100"
                                  />

                                  {/* 7. Consistency Score */}
                                  <MetricCard
                                    emoji="💪"
                                    badge="CONSISTENCIA"
                                    title="Consistencia"
                                    value={(() => {
                                      const badge = bestTimes[`${expandedStyle}_consistencyBadge`];
                                      if (!badge) return '—';
                                      const badges: Record<string, string> = {
                                        EXCELENTE: '🟢',
                                        BUENO: '🔵',
                                        REGULAR: '🟡',
                                        INCONSISTENTE: '🔴'
                                      };
                                      return <span>{badges[badge]} {badge}</span>;
                                    })()}
                                    subtitle={(() => {
                                      const score = bestTimes[`${expandedStyle}_consistencyScore`];
                                      return score != null ? `Desv: ${score.toFixed(2)}s` : '';
                                    })()}
                                    explanation="Mide qué tan estables son los tiempos. EXCELENTE (🟢) significa tiempos muy similares, lo que indica técnica sólida y rendimiento predecible."
                                    aiSummary={(() => {
                                      const badge = bestTimes[`${expandedStyle}_consistencyBadge`];
                                      const score = bestTimes[`${expandedStyle}_consistencyScore`];
                                      if (!badge) return 'Se necesitan más datos para evaluar consistencia.';
                                      const messages: Record<string, string> = {
                                        EXCELENTE: `¡Excelente! 🟢 Con solo ${score?.toFixed(2)}s de variación, demuestra técnica sólida y rendimiento muy predecible. Sigue así.`,
                                        BUENO: `Buena consistencia 🔵 con ${score?.toFixed(2)}s de variación. Los tiempos son bastante estables, señal de progreso técnico.`,
                                        REGULAR: `Consistencia regular 🟡 con ${score?.toFixed(2)}s de variación. Hay fluctuaciones pero con práctica mejorará.`,
                                        INCONSISTENTE: `Los tiempos varían ${score?.toFixed(2)}s 🔴. Es normal al inicio. Con entrenamiento constante la técnica se estabilizará.`
                                      };
                                      return messages[badge];
                                    })()}
                                    gradient="from-green-50 to-emerald-50"
                                    borderColor="border-green-300"
                                    textColor="text-green-700"
                                    badgeColor="text-green-700 bg-green-100"
                                  />

                                  {/* 8. % Mejora anual */}
                                  <MetricCard
                                    emoji="🎯"
                                    badge="ANUAL"
                                    title="Mejora Anual"
                                    value={(() => {
                                      const improvement = bestTimes[`${expandedStyle}_yearImprovement`];
                                      if (improvement == null) return '—';
                                      return (
                                        <span className={improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                                          {improvement > 0 ? '-' : '+'}{Math.abs(improvement).toFixed(2)}s
                                        </span>
                                      );
                                    })()}
                                    subtitle={(() => {
                                      const percent = bestTimes[`${expandedStyle}_yearImprovementPercent`];
                                      return percent != null ? `${percent > 0 ? '' : '-'}${Math.abs(percent).toFixed(1)}% este año` : '';
                                    })()}
                                    explanation="Compara el primer tiempo del año con el último. Un número negativo (verde) indica cuánto ha mejorado en la temporada."
                                    aiSummary={(() => {
                                      const improvement = bestTimes[`${expandedStyle}_yearImprovement`];
                                      const percent = bestTimes[`${expandedStyle}_yearImprovementPercent`];
                                      if (improvement == null) return 'Se necesitan más datos del año para calcular.';
                                      if (improvement > 0) return `¡Progreso impresionante! Ha mejorado ${improvement.toFixed(2)}s este año (${percent?.toFixed(1)}%). El entrenamiento está dando excelentes resultados.`;
                                      else if (improvement === 0) return 'Se mantiene en el mismo nivel que al inicio del año. Es momento de trabajar en nuevas técnicas.';
                                      else return `Los tiempos han subido ${Math.abs(improvement).toFixed(2)}s. Puede ser fase de crecimiento o cansancio. Importante monitorear.`;
                                    })()}
                                    gradient="from-pink-50 to-rose-50"
                                    borderColor="border-pink-300"
                                    textColor="text-pink-700"
                                    badgeColor="text-pink-700 bg-pink-100"
                                  />

                                  {/* 9. Ritmo mensual */}
                                  <MetricCard
                                    emoji="⚡"
                                    badge="MENSUAL"
                                    title="Ritmo Mensual"
                                    value={(() => {
                                      const monthly = bestTimes[`${expandedStyle}_monthlyImprovement`];
                                      if (monthly == null) return '—';
                                      return (
                                        <span className={monthly > 0 ? 'text-green-600' : 'text-red-600'}>
                                          {monthly > 0 ? '-' : '+'}{Math.abs(monthly).toFixed(2)}s
                                        </span>
                                      );
                                    })()}
                                    subtitle="por mes"
                                    explanation="Velocidad de mejora promedio cada mes. Permite proyectar cuándo alcanzará nuevas metas. Negativo = mejorando constantemente."
                                    aiSummary={(() => {
                                      const monthly = bestTimes[`${expandedStyle}_monthlyImprovement`];
                                      if (monthly == null) return 'Necesita más tiempo de datos para proyectar.';
                                      if (monthly > 0.5) return `⚡ ¡Ritmo excelente! Mejora ${monthly.toFixed(2)}s cada mes. A este paso alcanzará nuevas metas muy pronto.`;
                                      else if (monthly > 0) return `Mejora ${monthly.toFixed(2)}s por mes. Es un progreso sólido y sostenible. La constancia es clave.`;
                                      else if (monthly === 0) return 'Se mantiene estable sin mejoras significativas. Puede necesitar variar los entrenamientos.';
                                      else return `El rendimiento ha bajado ${Math.abs(monthly).toFixed(2)}s/mes. Importante revisar descanso y técnica.`;
                                    })()}
                                    gradient="from-violet-50 to-purple-50"
                                    borderColor="border-violet-300"
                                    textColor="text-violet-700"
                                    badgeColor="text-violet-700 bg-violet-100"
                                  />

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
  const c = Math.floor((secs - Math.floor(secs)) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(c).padStart(2, "0")}`;
}
