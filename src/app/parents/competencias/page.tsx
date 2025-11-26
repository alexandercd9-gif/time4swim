"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Trophy, Medal, Clock, Target, BarChart3, Table } from "lucide-react";
import CompetitionForm from "@/components/CompetitionForm";
import MedalleroModal from "@/components/MedalleroModal";
import TrainingChart from "@/components/TrainingChart";
import { toast } from "react-hot-toast";

interface Competition {
  id: string;
  style: string;
  poolSize: string;
  competition: string;
  date: string;
  distance: number;
  time: number;
  position?: number;
  medal?: string;
  notes?: string;
  isPersonalBest: boolean;
  child: {
    id: string;
    name: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
}

interface Swimmer {
  id: string;
  name: string;
}

interface StyleConfig {
  style: string;
  nameEs: string;
  nameEn: string;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [styles, setStyles] = useState<StyleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [medalleroOpen, setMedalleroOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  
  // Filtros
  const [filters, setFilters] = useState({
    swimmer: 'all',
    style: 'all',
    poolSize: 'all',
    distance: 'all',
    month: 'all',
    year: 'all'
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchCompetitions = async () => {
    try {
      const response = await fetch(`/api/competitions?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setCompetitions(data);
      } else {
        toast.error('Error al cargar competencias');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchSwimmers = async () => {
    try {
      const response = await fetch(`/api/swimmers?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setSwimmers(data);
        if (Array.isArray(data) && data.length > 0) {
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
            const exists = stored && data.some((d: any) => d.id === stored);
            setFilters((prev) => ({ ...prev, swimmer: exists ? (stored as string) : prev.swimmer }));
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error fetching swimmers:', error);
    }
  };

  const fetchStyles = async () => {
    try {
      const response = await fetch(`/api/config/styles?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStyles(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCompetitions();
    fetchSwimmers();
    fetchStyles();
  }, []);

  // Persistir selección de nadador del filtro para consistencia global
  useEffect(() => {
    if (filters.swimmer && filters.swimmer !== 'all') {
      try { localStorage.setItem('selectedChildId', filters.swimmer); } catch {}
    }
  }, [filters.swimmer]);

  const handleFormSuccess = () => {
    fetchCompetitions();
  };

  const handleDelete = async (competition: Competition) => {
    if (confirm(`¿Estás seguro de eliminar este registro de ${competition.competition}?`)) {
      try {
        const response = await fetch(`/api/competitions/${competition.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Registro eliminado exitosamente');
          fetchCompetitions();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al eliminar registro');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error de conexión');
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const centiseconds = Math.round((timeInSeconds % 1) * 100);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStyleName = (style: string) => {
    const config = styles.find(s => s.style === style);
    return config ? config.nameEs : style;
  };

  const getStyleIcon = (style: string) => {
    const iconMap: Record<string, string> = {
      'FREESTYLE': '/estilos/libre.png',
      'BACKSTROKE': '/estilos/espalda.png',
      'BREASTSTROKE': '/estilos/pecho.png',
      'BUTTERFLY': '/estilos/mariposa.png',
      'MEDLEY': '/estilos/combinado.png'
    };
    return iconMap[style] || '/estilos/libre.png';
  };

  const getPoolSize = (poolSize: string) => {
    const poolMap: Record<string, string> = {
      'SHORT_25M': 'Piscina 25m',
      'LONG_50M': 'Piscina 50m',
      'OPEN_WATER': 'Aguas abiertas'
    };
    return poolMap[poolSize] || poolSize;
  };

  const getPositionBadge = (position?: number) => {
    if (!position) return null;
    
    const colors = {
      1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      2: 'bg-gray-100 text-gray-800 border-gray-300',
      3: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    
    const color = colors[position as keyof typeof colors] || 'bg-blue-100 text-blue-800 border-blue-300';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {position <= 3 && <Medal className="h-3 w-3 mr-1" />}
        {position}° lugar
      </span>
    );
  };

  const getMedalBadge = (medal?: string) => {
    if (!medal || medal === 'NONE') return <span className="text-sm text-gray-400">—</span>;
    
    const medals = {
      'GOLD': { emoji: '🥇', text: 'Oro', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'SILVER': { emoji: '🥈', text: 'Plata', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      'BRONZE': { emoji: '🥉', text: 'Bronce', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    };
    
    const medalInfo = medals[medal as keyof typeof medals];
    if (!medalInfo) return <span className="text-sm text-gray-400">—</span>;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${medalInfo.color}`}>
        <span className="mr-1">{medalInfo.emoji}</span>
        {medalInfo.text}
      </span>
    );
  };

  // Filtrar competencias
  const filteredCompetitions = competitions.filter((comp: Competition) => {
    const matchesSwimmer = filters.swimmer === 'all' || !filters.swimmer || comp.child.id === filters.swimmer;
    const matchesStyle = filters.style === 'all' || !filters.style || comp.style === filters.style;
    const matchesPoolSize = filters.poolSize === 'all' || !filters.poolSize || comp.poolSize === filters.poolSize;
    const matchesDistance = filters.distance === 'all' || !filters.distance || comp.distance === parseInt(filters.distance);
    
    // Filtro por mes y año
    const compDate = new Date(comp.date);
    const matchesMonth = filters.month === 'all' || compDate.getMonth() === parseInt(filters.month);
    const matchesYear = filters.year === 'all' || compDate.getFullYear() === parseInt(filters.year);
    
    return matchesSwimmer && matchesStyle && matchesPoolSize && matchesDistance && matchesMonth && matchesYear;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCompetitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompetitions = filteredCompetitions.slice(startIndex, endIndex);

  // Obtener años, meses y distancias únicos de las competencias
  const availableYears = Array.from(new Set(competitions.map(c => new Date(c.date).getFullYear()))).sort((a, b) => b - a);
  const availableMonths = Array.from(new Set(competitions.map(c => new Date(c.date).getMonth()))).sort((a, b) => a - b);
  const availableDistances = Array.from(new Set(competitions.map(c => c.distance))).sort((a, b) => a - b);

  // Reset a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.swimmer, filters.style, filters.poolSize, filters.distance, filters.month, filters.year]);

  // Estadísticas
  const stats = {
    total: filteredCompetitions.length,
    personalBests: filteredCompetitions.filter((c: Competition) => c.isPersonalBest).length,
    medals: filteredCompetitions.filter((c: Competition) => (c.medal && c.medal !== 'NONE') || (c.position && c.position <= 3)).length,
    avgTime: filteredCompetitions.length > 0 
      ? filteredCompetitions.reduce((sum: number, c: Competition) => sum + c.time, 0) / filteredCompetitions.length 
      : 0
  };

  // Calcular diferencia con la competencia anterior
  // SOLO si los filtros están específicos (no en "all")
  const getTimeDifference = () => {
    // Validar que los filtros críticos estén seleccionados específicamente
    const hasSpecificFilters = 
      filters.style !== 'all' && 
      filters.poolSize !== 'all' && 
      filters.distance !== 'all';
    
    // Si no hay filtros específicos, no calcular progreso
    if (!hasSpecificFilters) return null;
    
    // Las competencias ya están filtradas, solo comparamos las 2 más recientes
    if (filteredCompetitions.length < 2) return null;
    
    // Ordenar por fecha descendente (más reciente primero)
    const sorted = [...filteredCompetitions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastComp = sorted[0];
    const previousComp = sorted[1];
    
    const diff = lastComp.time - previousComp.time;
    const improving = diff < 0; // Negativo significa que mejoró (menos tiempo)
    
    return {
      diff: Math.abs(diff),
      improving,
      lastTime: lastComp.time,
      previousTime: previousComp.time
    };
  };

  const timeDiff = getTimeDifference();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center text-muted-foreground">
          <p>Cargando competencias...</p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-7 w-7 text-yellow-600" />
            Competencias
          </h1>
          <p className="text-gray-600 hidden sm:block">
            Registra y gestiona las competencias de tus nadadores
          </p>
        </div>
        {/* Botones de acción - En móvil: 2 columnas + fila completa, en desktop: 3 en línea */}
        <div className="w-full sm:w-auto">
          {/* Vista móvil: 2 columnas en primera fila */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <Button 
              onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')} 
              variant="outline"
              className="w-full"
            >
              {viewMode === 'table' ? (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Gráfico
                </>
              ) : (
                <>
                  <Table className="mr-2 h-4 w-4" />
                  Ver Tabla
                </>
              )}
            </Button>
            <Button 
              onClick={() => setMedalleroOpen(true)} 
              variant="outline"
              className="w-full"
            >
              <Medal className="mr-2 h-4 w-4" />
              Ver Medallero
            </Button>
          </div>
          {/* Vista móvil: Nueva Competencia en segunda fila completa */}
          <Button 
            onClick={() => setFormOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 w-full mt-2 sm:hidden"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Nueva Competencia
          </Button>
          
          {/* Vista desktop/tablet: 3 botones en línea horizontal */}
          <div className="hidden sm:flex gap-2">
            <Button 
              onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')} 
              variant="outline"
            >
              {viewMode === 'table' ? (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Gráfico
                </>
              ) : (
                <>
                  <Table className="mr-2 h-4 w-4" />
                  Ver Tabla
                </>
              )}
            </Button>
            <Button 
              onClick={() => setMedalleroOpen(true)} 
              variant="outline"
            >
              <Medal className="mr-2 h-4 w-4" />
              Ver Medallero
            </Button>
            <Button 
              onClick={() => setFormOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Nueva Competencia
            </Button>
          </div>
        </div>
  </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center tracking-tight">Total Competencias</h3>
          <div className="flex items-center justify-between">
            <Trophy className="h-10 w-10 text-blue-500" />
            <p className="text-4xl md:text-5xl font-bold text-blue-600">{stats.total}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-cyan-50 to-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center tracking-tight">Mejores Tiempos</h3>
          <div className="flex items-center justify-between">
            <Target className="h-10 w-10 text-cyan-500" />
            <p className="text-4xl md:text-5xl font-bold text-cyan-600">{stats.personalBests}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center tracking-tight">Medallas</h3>
          <div className="flex items-center justify-between">
            <Medal className="h-10 w-10 text-yellow-500" />
            <p className="text-4xl md:text-5xl font-bold text-yellow-600">{stats.medals}</p>
          </div>
        </div>
        
        <div className={`relative overflow-hidden rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
          timeDiff ? (timeDiff.improving ? 'bg-gradient-to-br from-green-50 to-white' : 'bg-gradient-to-br from-red-50 to-white') : 'bg-gradient-to-br from-gray-50 to-white'
        }`}>
          <h3 className="text-sm font-bold text-gray-700 mb-3 text-center tracking-tight">
            Progreso
          </h3>
          <div className="flex items-center justify-between">
            {timeDiff ? (
              timeDiff.improving ? (
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )
            ) : (
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            )}
            <div className="text-right">
              {timeDiff ? (
                <>
                  <p className={`text-4xl md:text-5xl font-bold font-mono ${
                    timeDiff.improving ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {timeDiff.improving ? '−' : '+'}{formatTime(timeDiff.diff)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">vs última competencia</p>
                </>
              ) : (
                <p className="text-xs text-gray-500 leading-tight mt-1">
                  🎯 Filtra por estilo, piscina y distancia para ver tu progreso
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        {/* Barra de filtros compacta */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          {/* Filtros en grid - En vista gráfico: 4 columnas, en vista tabla: 6 columnas */}
          <div className={`grid grid-cols-2 gap-3 ${viewMode === 'chart' ? 'lg:grid-cols-4' : 'lg:grid-cols-6'}`}>
              <Select
                value={filters.swimmer}
                onValueChange={(value) => setFilters({ ...filters, swimmer: value })}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los nadadores</SelectItem>
                  {swimmers.map((swimmer) => (
                    <SelectItem key={swimmer.id} value={swimmer.id}>
                      {swimmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.style}
                onValueChange={(value) => setFilters({ ...filters, style: value, poolSize: 'all', distance: 'all' })}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estilos</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style.style} value={style.style}>
                      <div className="flex items-center gap-2">
                        <img src={getStyleIcon(style.style)} alt={style.nameEs} className="h-5 w-5" />
                        {style.nameEs}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {viewMode === 'table' && (
                <>
                  <Select
                    value={filters.poolSize}
                    onValueChange={(value) => setFilters({ ...filters, poolSize: value })}
                  >
                    <SelectTrigger className="w-full border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las piscinas</SelectItem>
                      <SelectItem value="SHORT_25M">Piscina de 25m</SelectItem>
                      <SelectItem value="LONG_50M">Piscina de 50m</SelectItem>
                      <SelectItem value="OPEN_WATER">Aguas abiertas</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.distance}
                    onValueChange={(value) => setFilters({ ...filters, distance: value })}
                  >
                    <SelectTrigger className="w-full border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las distancias</SelectItem>
                      {availableDistances.map((distance) => (
                        <SelectItem key={distance} value={distance.toString()}>
                          {distance}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters({ ...filters, year: value })}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filters.month}
                onValueChange={(value) => setFilters({ ...filters, month: value })}
              >
                <SelectTrigger className="w-full border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  <SelectItem value="0">Enero</SelectItem>
                  <SelectItem value="1">Febrero</SelectItem>
                  <SelectItem value="2">Marzo</SelectItem>
                  <SelectItem value="3">Abril</SelectItem>
                  <SelectItem value="4">Mayo</SelectItem>
                  <SelectItem value="5">Junio</SelectItem>
                  <SelectItem value="6">Julio</SelectItem>
                  <SelectItem value="7">Agosto</SelectItem>
                  <SelectItem value="8">Septiembre</SelectItem>
                  <SelectItem value="9">Octubre</SelectItem>
                  <SelectItem value="10">Noviembre</SelectItem>
                  <SelectItem value="11">Diciembre</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      {/* Vista de Gráfico */}
      {viewMode === 'chart' ? (
        <div className="rounded-lg border bg-white shadow-sm p-6">
          <TrainingChart 
            childId={filters.swimmer !== 'all' ? filters.swimmer : undefined}
            competitions={filteredCompetitions.map(comp => ({
              id: comp.id,
              date: comp.date,
              time: comp.time,
              distance: comp.distance,
              style: comp.style,
              childId: comp.child.id,
              poolSize: comp.poolSize
            }))}
          />
        </div>
      ) : (
        <>
      {/* Competitions - Desktop Table & Mobile Cards */}
      {filteredCompetitions.length === 0 ? (
        <div className="rounded-lg border bg-white shadow-sm p-12">
          <div className="flex flex-col items-center space-y-4">
            <Trophy className="h-12 w-12 text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">No hay competencias registradas</h3>
              <p className="text-gray-500 mt-1">
                Comienza agregando la primera competencia
              </p>
            </div>
            <Button onClick={() => setFormOpen(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Trophy className="mr-2 h-4 w-4" />
              Agregar Primera Competencia
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium text-gray-700">Nadador</th>
                    <th className="text-left p-4 font-medium text-gray-700">Competencia</th>
                    <th className="text-left p-4 font-medium text-gray-700">Estilo & Distancia</th>
                    <th className="text-left p-4 font-medium text-gray-700">Tiempo</th>
                    <th className="text-left p-4 font-medium text-gray-700">Posición</th>
                    <th className="text-left p-4 font-medium text-gray-700">Medalla</th>
                    <th className="text-left p-4 font-medium text-gray-700">Fecha</th>
                    <th className="text-right p-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompetitions.map((competition) => (
                    <tr key={competition.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{competition.child.name}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{competition.competition}</p>
                          {competition.notes && (
                            <p className="text-sm text-gray-500">{competition.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">{getStyleName(competition.style)}</p>
                          <p className="text-sm text-gray-500">
                            {competition.distance >= 1000 
                              ? `${(competition.distance / 1000).toFixed(1)}km` 
                              : `${competition.distance}m`} - {getPoolSize(competition.poolSize)}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-semibold text-gray-900">{formatTime(competition.time)}</span>
                          {competition.isPersonalBest && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              <Target className="h-3 w-3 mr-1" />
                              MT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getPositionBadge(competition.position)}
                      </td>
                      <td className="p-4">
                        {getMedalBadge(competition.medal)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700">{formatDate(competition.date)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCompetition(competition);
                              setFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(competition)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedCompetitions.map((competition) => (
              <div key={competition.id} className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{competition.child.name}</p>
                    <p className="font-medium text-blue-600 mt-1">{competition.competition}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCompetition(competition);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(competition)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {/* Estilo y Distancia */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estilo:</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{getStyleName(competition.style)}</p>
                      <p className="text-xs text-gray-500">
                        {competition.distance >= 1000 
                          ? `${(competition.distance / 1000).toFixed(1)}km` 
                          : `${competition.distance}m`} - {getPoolSize(competition.poolSize)}
                      </p>
                    </div>
                  </div>

                  {/* Tiempo */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tiempo:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-lg text-gray-900">{formatTime(competition.time)}</span>
                      {competition.isPersonalBest && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                          <Target className="h-3 w-3 mr-1" />
                          MT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Posición y Medalla */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Resultado:</span>
                    <div className="flex items-center space-x-2">
                      {getPositionBadge(competition.position)}
                      {getMedalBadge(competition.medal)}
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fecha:</span>
                    <span className="text-sm font-medium text-gray-700">{formatDate(competition.date)}</span>
                  </div>

                  {/* Notas */}
                  {competition.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Notas:</p>
                      <p className="text-sm text-gray-700">{competition.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border mt-4">
              <div className="text-sm text-gray-700 font-medium">
                Página {currentPage} de {totalPages} • Mostrando {startIndex + 1}-{Math.min(endIndex, filteredCompetitions.length)} de {filteredCompetitions.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      </>
      )}

      {/* Competition Form Modal */}
      <CompetitionForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCompetition(null);
        }}
        onSuccess={handleFormSuccess}
        competition={editingCompetition}
      />

      {/* Medallero Modal */}
      <MedalleroModal
        isOpen={medalleroOpen}
        onClose={() => setMedalleroOpen(false)}
        swimmers={swimmers}
        competitions={competitions}
      />
      </div>
    </div>
  );
}
