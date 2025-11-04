"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Type, ArrowLeft, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getCategoriesForCompetitionYear, type Category } from "@/lib/categories";

export default function NewClubEventPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cargar categorías cuando cambia la fecha o al montar
  useEffect(() => {
    const eventYear = date ? new Date(date).getFullYear() : new Date().getFullYear();
    const categories = getCategoriesForCompetitionYear(eventYear);
    setAllCategories(categories);
  }, [date]);

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
    if (!title || !date) {
      toast.error("Título y fecha son obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Convertir la fecha a formato datetime ISO con hora por defecto (09:00)
      const dateObj = new Date(date);
      dateObj.setHours(9, 0, 0, 0); // Establecer hora por defecto a las 9:00 AM
      
      const res = await fetch('/api/club/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title, 
          date: dateObj.toISOString(), 
          location,
          eligibleCategories: selectedCategories.length > 0 ? selectedCategories : null
        })
      });

      if (res.ok) {
        toast.success('¡Evento creado! Los padres lo verán en su dashboard.', {
          icon: '🎉',
          duration: 4000,
        });
        setTitle(''); 
        setDate(''); 
        setLocation('');
        setSelectedCategories([]);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/club/events"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Eventos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear Nuevo Evento</h1>
        <p className="text-sm text-gray-600">Los eventos aparecerán automáticamente en el dashboard de los padres</p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos en horizontal responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Título */}
              <div className="space-y-2">
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

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Fecha del Evento *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {allCategories.map((category) => (
                  <div
                    key={category.code}
                    className={`flex items-start space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedCategories.includes(category.code)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCategory(category.code)}
                  >
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
            {title && date && (
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
                          {new Date(date).toLocaleDateString('es-ES', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
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
