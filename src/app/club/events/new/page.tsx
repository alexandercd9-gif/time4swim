"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Type, ArrowLeft, Sparkles, Users, Timer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoriesForCompetitionYear, type Category } from "@/lib/categories";

export default function NewClubEventPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  
  // Competencia Interna
  const [isInternalCompetition, setIsInternalCompetition] = useState(false);
  const [style, setStyle] = useState<string | undefined>(undefined);
  const [distance, setDistance] = useState<string | undefined>(undefined);
  
  // Distancias personalizadas por categoría (key: categoryCode, value: distance in meters)
  const [categoryDistances, setCategoryDistances] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cargar categorías cuando cambia la fecha o al montar
  useEffect(() => {
    const eventYear = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
    const categories = getCategoriesForCompetitionYear(eventYear);
    setAllCategories(categories);
  }, [startDate]);

  // Limpiar distancias personalizadas de categorías que ya no están seleccionadas
  useEffect(() => {
    if (isInternalCompetition) {
      setCategoryDistances(prev => {
        const updated = { ...prev };
        // Eliminar distancias de categorías no seleccionadas
        Object.keys(updated).forEach(cat => {
          if (!selectedCategories.includes(cat)) {
            delete updated[cat];
          }
        });
        return updated;
      });
    }
  }, [selectedCategories, isInternalCompetition]);

  const toggleCategory = (categoryCode: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryCode)
        ? prev.filter(c => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(allCategories.map(c => c.code));
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast.error("Título, fecha de inicio y fecha de fin son obligatorios");
      return;
    }

    // Validación específica para competencias internas
    if (isInternalCompetition) {
      if (!style || !distance) {
        toast.error("Para competencias internas debes completar: Estilo y Distancia");
        return;
      }
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      toast.error("La fecha de fin debe ser posterior o igual a la fecha de inicio");
      return;
    }

    setLoading(true);
    try {
      // Convertir las fechas a formato datetime ISO con horas por defecto
      // Parsear correctamente para evitar problemas de timezone
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const startDateObj = new Date(startYear, startMonth - 1, startDay, 9, 0, 0, 0); // Inicio a las 9:00 AM
      
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const endDateObj = new Date(endYear, endMonth - 1, endDay, 18, 0, 0, 0); // Fin a las 6:00 PM
      
      const res = await fetch('/api/club/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title, 
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString(), 
          location,
          eligibleCategories: selectedCategories.length > 0 ? selectedCategories : null,
          isInternalCompetition,
          style: isInternalCompetition ? style : null,
          distance: isInternalCompetition && distance ? parseInt(distance) : null,
          lanes: null, // Los carriles se asignarán después
          categoryDistances: isInternalCompetition && Object.keys(categoryDistances).length > 0 
            ? categoryDistances 
            : null
        })
      });

      if (res.ok) {
        const message = isInternalCompetition 
          ? '¡Competencia interna creada! Ahora puedes asignar nadadores a los carriles.' 
          : '¡Evento creado! Los padres lo verán en su dashboard.';
        toast.success(message, {
          icon: '🎉',
          duration: 4000,
        });
        setTitle(''); 
        setStartDate('');
        setEndDate(''); 
        setLocation('');
        setSelectedCategories([]);
        setIsInternalCompetition(false);
        setStyle(undefined);
        setDistance(undefined);
        setCategoryDistances({});
        setTimeout(() => router.push('/club/events'), 500);
      } else if (res.status === 401 || res.status === 403) {
        const err = await res.json();
        toast.error(err?.error || 'No autorizado');
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Error al crear evento');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6">
      {/* Header */}
      <div>
        <Link
          href="/club/events"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Eventos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          Crear Nuevo Evento
        </h1>
        <p className="text-gray-600 mt-2">
          Los eventos aparecerán automáticamente en el dashboard de los padres
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos en una sola fila responsive */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Título */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                  <Type className="h-4 w-4 text-blue-600" />
                  Título del Evento *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Copa Nacional Infantil 2025"
                  required
                  className="h-11"
                />
              </div>

              {/* Fecha Inicio */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Fecha de Fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Ubicación (opcional)
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Polideportivo Municipal"
                  className="h-11"
                />
              </div>
            </div>

            {/* Competencia Interna */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isInternalCompetition"
                  checked={isInternalCompetition}
                  onCheckedChange={(checked) => setIsInternalCompetition(checked as boolean)}
                />
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-600" />
                  <Label
                    htmlFor="isInternalCompetition"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Es Competencia Interna (con cronometraje)
                  </Label>
                </div>
              </div>
              
              {isInternalCompetition && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm text-blue-900 font-medium">
                      Configura la prueba interna para cronometraje en vivo
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      💡 Puedes asignar distancias específicas por categoría más abajo. Si no lo haces, todas usarán la distancia general.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Estilo */}
                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-sm font-medium">
                        Estilo de Nado *
                      </Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue placeholder="Selecciona estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREESTYLE">Libre</SelectItem>
                          <SelectItem value="BACKSTROKE">Espalda</SelectItem>
                          <SelectItem value="BREASTSTROKE">Pecho</SelectItem>
                          <SelectItem value="BUTTERFLY">Mariposa</SelectItem>
                          <SelectItem value="INDIVIDUAL_MEDLEY">Combinado Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Distancia General */}
                    <div className="space-y-2">
                      <Label htmlFor="distance" className="text-sm font-medium">
                        Distancia General (metros) *
                      </Label>
                      <Select value={distance} onValueChange={setDistance}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue placeholder="Selecciona distancia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25m</SelectItem>
                          <SelectItem value="50">50m</SelectItem>
                          <SelectItem value="100">100m</SelectItem>
                          <SelectItem value="200">200m</SelectItem>
                          <SelectItem value="400">400m</SelectItem>
                          <SelectItem value="800">800m</SelectItem>
                          <SelectItem value="1500">1500m</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Para categorías sin distancia específica
                      </p>
                    </div>
                  </div>

                  {style && distance && (
                    <div className="bg-white rounded-md p-3 border border-blue-200 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">Resumen de la prueba:</p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{distance}m {style === 'FREESTYLE' ? 'Libre' : style === 'BACKSTROKE' ? 'Espalda' : style === 'BREASTSTROKE' ? 'Pecho' : style === 'BUTTERFLY' ? 'Mariposa' : 'Combinado'}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Los carriles se asignarán antes de iniciar la competencia
                        </p>
                      </div>
                      {Object.keys(categoryDistances).length > 0 && (
                        <div className="pt-2 border-t border-blue-100">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Distancias personalizadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(categoryDistances).map(([catCode, dist]) => {
                              const cat = allCategories.find(c => c.code === catCode);
                              return cat && dist ? (
                                <span key={catCode} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {cat.name}: {dist}m
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selección de Categorías */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-blue-600" />
                  Categorías Elegibles
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllCategories}
                    className="text-xs h-7"
                  >
                    Seleccionar todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearCategories}
                    className="text-xs h-7"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Selecciona las categorías que pueden participar. Si no seleccionas ninguna, el evento será visible para todas las categorías.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allCategories.map((category) => (
                  <div
                    key={category.code}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedCategories.includes(category.code)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={category.code}
                        checked={selectedCategories.includes(category.code)}
                        onCheckedChange={() => toggleCategory(category.code)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={category.code}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {category.name}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Selector de distancia específica para competencia interna */}
                    {isInternalCompetition && selectedCategories.includes(category.code) && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <Label htmlFor={`distance-${category.code}`} className="text-xs text-gray-700 mb-1 block">
                          Distancia específica (opcional)
                        </Label>
                        <Select 
                          value={categoryDistances[category.code] || "general"} 
                          onValueChange={(value) => {
                            if (value === "general") {
                              // Eliminar la distancia personalizada para usar la general
                              setCategoryDistances(prev => {
                                const updated = { ...prev };
                                delete updated[category.code];
                                return updated;
                              });
                            } else {
                              setCategoryDistances(prev => ({
                                ...prev,
                                [category.code]: value
                              }));
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Usar distancia general" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Usar distancia general</SelectItem>
                            <SelectItem value="25">25m</SelectItem>
                            <SelectItem value="50">50m</SelectItem>
                            <SelectItem value="100">100m</SelectItem>
                            <SelectItem value="200">200m</SelectItem>
                            <SelectItem value="400">400m</SelectItem>
                            <SelectItem value="800">800m</SelectItem>
                            <SelectItem value="1500">1500m</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs text-gray-600">Seleccionadas:</span>
                  {selectedCategories.map(code => {
                    const cat = allCategories.find(c => c.code === code);
                    return cat ? (
                      <span
                        key={code}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {cat.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Vista previa */}
            {title && startDate && endDate && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Vista previa del evento</p>
                    <div className="bg-white rounded-md p-3 border border-blue-100">
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {(() => {
                            const [year, month, day] = startDate.split('-');
                            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            return date.toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          })()}
                          {startDate !== endDate && (
                            <> - {(() => {
                              const [year, month, day] = endDate.split('-');
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              return date.toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              });
                            })()}</>
                          )}
                        </span>
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando evento...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Crear Evento
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/club/events')}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
