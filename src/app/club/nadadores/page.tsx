"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Calendar, Trophy, Activity, Mail, Phone, MapPin, LayoutGrid, List, Settings, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

interface Parent {
  user: {
    id: string;
    name: string;
    email: string;
    parentType: string | null;
  };
}

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  age: number;
  photo: string | null;
  coach: string | null;
  totalRecords: number;
  totalTrainings: number;
  personalBests: number;
  parents: Parent[];
}

export default function ClubSwimmersPage() {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  // Estado para columnas visibles (por defecto oculta records, mejores, entrenos)
  const [visibleColumns, setVisibleColumns] = useState({
    nadador: true,
    genero: true,
    categoria: true,
    edad: true,
    entrenador: true,
    fechaNac: true,
    records: false,
    mejores: false,
    entrenos: false,
    padres: true,
  });

  const toggleColumn = (columnKey: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  useEffect(() => {
    fetchSwimmers();
  }, []);

  const fetchSwimmers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/club/swimmers");
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error response:", data);
        toast.error(data.error || "Error al cargar nadadores del club");
        throw new Error(data.error || "Error al cargar nadadores");
      }

      setSwimmers(data.swimmers || []);
      setClubName(data.club?.name || "Club");
    } catch (error) {
      console.error("Error completo:", error);
      toast.error("Error al cargar nadadores del club");
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular categoría FDPN según año de nacimiento
  // IMPORTANTE: Las categorías FDPN se calculan por AÑO DE NACIMIENTO, no por edad actual
  // Ejemplo: Nacido en 2019 → En 2025 tiene 6 años → Pre-Mínima
  const getSwimmerCategory = (birthDate: string, gender: string) => {
    const birth = new Date(birthDate);
    const currentYear = new Date().getFullYear();
    const birthYear = birth.getFullYear();
    const yearDifference = currentYear - birthYear;

    // Categorías FDPN 2025 según año de nacimiento
    // Pre-Mínima: 2019 y posteriores (≤6 años en 2025)
    if (yearDifference <= 6) return { code: "pre_minima", name: "Pre-Mínima", years: "2019+" };
    
    // Mínima 1: 2017-2018 (7-8 años en 2025)
    if (yearDifference <= 8) return { code: "minima_1", name: "Mínima 1", years: "2017-2018" };
    
    // Mínima 2: 2015-2016 (9-10 años en 2025)
    if (yearDifference <= 10) return { code: "minima_2", name: "Mínima 2", years: "2015-2016" };
    
    // Infantil A1: 2014 (11 años en 2025)
    if (yearDifference === 11) return { code: "infantil_a1", name: "Infantil A1", years: "2014" };
    
    // Infantil A2: 2013 (12 años en 2025)
    if (yearDifference === 12) return { code: "infantil_a2", name: "Infantil A2", years: "2013" };
    
    // Infantil B1: 2012 (13 años en 2025)
    if (yearDifference === 13) return { code: "infantil_b1", name: "Infantil B1", years: "2012" };
    
    // Infantil B2: 2011 (14 años en 2025)
    if (yearDifference === 14) return { code: "infantil_b2", name: "Infantil B2", years: "2011" };
    
    // Juvenil A: 2010 (15 años en 2025)
    if (yearDifference === 15) return { code: "juvenil_a", name: "Juvenil A", years: "2010" };
    
    // Juvenil B: 2009 (16 años en 2025)
    if (yearDifference === 16) return { code: "juvenil_b", name: "Juvenil B", years: "2009" };
    
    // Juvenil C: 2008 (17 años en 2025)
    if (yearDifference === 17) return { code: "juvenil_c", name: "Juvenil C", years: "2008" };
    
    // Junior: 2006-2007 (18-19 años en 2025)
    if (yearDifference <= 19) return { code: "junior", name: "Junior", years: "2006-2007" };
    
    // Senior: 2001-2005 (20-24 años en 2025)
    if (yearDifference <= 24) return { code: "senior", name: "Senior", years: "2001-2005" };
    
    // Master: 2000 y anteriores (25+ años en 2025)
    return { code: "master", name: "Master", years: "2000-" };
  };

  // Obtener todas las categorías únicas
  const allCategories = Array.from(
    new Set(
      swimmers.map(s => {
        const cat = getSwimmerCategory(s.birthDate, s.gender);
        return JSON.stringify(cat);
      })
    )
  ).map(str => JSON.parse(str)).sort((a, b) => {
    const order = ["pre_minima", "minima_1", "minima_2", "infantil_a1", "infantil_a2", "infantil_b1", "infantil_b2", "juvenil_a", "juvenil_b", "juvenil_c", "junior", "senior", "master"];
    return order.indexOf(a.code) - order.indexOf(b.code);
  });

  const filteredSwimmers = swimmers.filter(swimmer => {
    const matchesName = swimmer.name.toLowerCase().includes(filter.toLowerCase());
    const category = getSwimmerCategory(swimmer.birthDate, swimmer.gender);
    const matchesCategory = categoryFilter === "all" || category.code === categoryFilter;
    return matchesName && matchesCategory;
  });

  const getGenderBadge = (gender: string) => {
    return gender === "MALE" ? (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
        Masculino
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-700">
        Femenino
      </span>
    );
  };

  const getParentTypeLabel = (type: string | null) => {
    const types: { [key: string]: string } = {
      PADRE: "Padre",
      MADRE: "Madre",
      TUTOR: "Tutor/a",
      ABUELO: "Abuelo",
      ABUELA: "Abuela",
      OTRO: "Otro"
    };
    return type ? types[type] || type : "Familiar";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Nadadores del Club
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los nadadores registrados en {clubName} • {swimmers.length} nadadores
          </p>
        </div>

        {/* Search Filter & View Toggle */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Vista de tarjetas"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Vista de tabla"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Column Visibility Toggle (solo visible en vista tabla) */}
              {viewMode === "table" && (
                <div className="relative group shrink-0">
                  <button
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Configurar columnas"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  {/* Dropdown de columnas */}
                  <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                      Columnas visibles
                    </div>
                    
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.genero}
                        onChange={() => toggleColumn('genero')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Género</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.categoria}
                        onChange={() => toggleColumn('categoria')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Categoría</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.edad}
                        onChange={() => toggleColumn('edad')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Edad</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.entrenador}
                        onChange={() => toggleColumn('entrenador')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Entrenador</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.fechaNac}
                        onChange={() => toggleColumn('fechaNac')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Fecha Nac.</span>
                    </label>

                    <div className="border-t my-1"></div>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.records}
                        onChange={() => toggleColumn('records')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Records</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.mejores}
                        onChange={() => toggleColumn('mejores')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Mejores</span>
                    </label>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.entrenos}
                        onChange={() => toggleColumn('entrenos')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Entrenos</span>
                    </label>

                    <div className="border-t my-1"></div>

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.padres}
                        onChange={() => toggleColumn('padres')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Padres/Tutores</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex items-center gap-2 shrink-0 min-w-[180px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todas las categorías</option>
                  {allCategories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-2 flex-1">
                <User className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar nadador por nombre..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Swimmers List */}
        {filteredSwimmers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
              <p className="text-gray-500 text-lg">
                {filter ? "No se encontraron nadadores" : "No hay nadadores registrados en el club"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {filter ? "Intenta con otro término de búsqueda" : "Los padres pueden asignar a sus hijos al club desde sus perfiles"}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          /* Vista de Tarjetas (Grid) */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSwimmers.map((swimmer) => (
              <Card key={swimmer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {swimmer.photo ? (
                      <img
                        src={swimmer.photo}
                        alt={swimmer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                        {swimmer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{swimmer.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getGenderBadge(swimmer.gender)}
                        <span className="text-sm text-gray-500">{swimmer.age} años</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                          {getSwimmerCategory(swimmer.birthDate, swimmer.gender).name}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Coach */}
                  {swimmer.coach && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{swimmer.coach}</span>
                    </div>
                  )}

                  {/* Birth Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {new Date(swimmer.birthDate).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{swimmer.totalRecords}</div>
                      <div className="text-xs text-gray-500">Records</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{swimmer.personalBests}</div>
                      <div className="text-xs text-gray-500">Mejores</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{swimmer.totalTrainings}</div>
                      <div className="text-xs text-gray-500">Entrenos</div>
                    </div>
                  </div>

                  {/* Parents */}
                  {swimmer.parents.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Padres/Tutores:</div>
                      {swimmer.parents.map((parent, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 mb-1">
                          <Mail className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{parent.user.name}</div>
                            <div className="text-gray-500 truncate">{parent.user.email}</div>
                            <div className="text-gray-400">{getParentTypeLabel(parent.user.parentType)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Vista de Tabla */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {visibleColumns.nadador && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nadador
                        </th>
                      )}
                      {visibleColumns.genero && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Género
                        </th>
                      )}
                      {visibleColumns.categoria && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                      )}
                      {visibleColumns.edad && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Edad
                        </th>
                      )}
                      {visibleColumns.entrenador && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entrenador
                        </th>
                      )}
                      {visibleColumns.fechaNac && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Nac.
                        </th>
                      )}
                      {visibleColumns.records && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Records
                        </th>
                      )}
                      {visibleColumns.mejores && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mejores
                        </th>
                      )}
                      {visibleColumns.entrenos && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entrenos
                        </th>
                      )}
                      {visibleColumns.padres && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Padres/Tutores
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSwimmers.map((swimmer) => (
                      <tr key={swimmer.id} className="hover:bg-gray-50 transition-colors">
                        {visibleColumns.nadador && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {swimmer.photo ? (
                                <img
                                  src={swimmer.photo}
                                  alt={swimmer.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                                  {swimmer.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="font-medium text-gray-900">{swimmer.name}</div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.genero && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getGenderBadge(swimmer.gender)}
                          </td>
                        )}
                        {visibleColumns.categoria && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                              {getSwimmerCategory(swimmer.birthDate, swimmer.gender).name}
                            </span>
                          </td>
                        )}
                        {visibleColumns.edad && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {swimmer.age} años
                          </td>
                        )}
                        {visibleColumns.entrenador && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {swimmer.coach || "-"}
                          </td>
                        )}
                        {visibleColumns.fechaNac && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(swimmer.birthDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                        )}
                        {visibleColumns.records && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-blue-600">{swimmer.totalRecords}</span>
                          </td>
                        )}
                        {visibleColumns.mejores && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-yellow-600">{swimmer.personalBests}</span>
                          </td>
                        )}
                        {visibleColumns.entrenos && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-lg font-bold text-green-600">{swimmer.totalTrainings}</span>
                          </td>
                        )}
                        {visibleColumns.padres && (
                          <td className="px-6 py-4">
                            <div className="space-y-1 max-w-xs">
                              {swimmer.parents.map((parent, idx) => (
                                <div key={idx} className="text-xs">
                                  <div className="font-medium text-gray-900 truncate">{parent.user.name}</div>
                                  <div className="text-gray-500 truncate">{parent.user.email}</div>
                                  <div className="text-gray-400">{getParentTypeLabel(parent.user.parentType)}</div>
                                </div>
                              ))}
                              {swimmer.parents.length === 0 && (
                                <span className="text-xs text-gray-400">Sin contacto</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
