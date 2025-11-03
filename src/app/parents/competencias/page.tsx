"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Trophy, Medal, Clock, Target, Search } from "lucide-react";
import CompetitionForm from "@/components/CompetitionForm";
import MedalleroModal from "@/components/MedalleroModal";
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
  
  // Filtros
  const [filters, setFilters] = useState({
    swimmer: 'all',
    style: 'all',
    search: ''
  });

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
    const matchesSearch = !filters.search || 
      comp.competition.toLowerCase().includes(filters.search.toLowerCase()) ||
      comp.child.name.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSwimmer && matchesStyle && matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: filteredCompetitions.length,
    personalBests: filteredCompetitions.filter((c: Competition) => c.isPersonalBest).length,
    medals: filteredCompetitions.filter((c: Competition) => (c.medal && c.medal !== 'NONE') || (c.position && c.position <= 3)).length,
    avgTime: filteredCompetitions.length > 0 
      ? filteredCompetitions.reduce((sum: number, c: Competition) => sum + c.time, 0) / filteredCompetitions.length 
      : 0
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="text-center text-muted-foreground">
          <p>Cargando competencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competencias</h1>
          <p className="text-gray-600">
            Registra y gestiona las competencias de tus nadadores
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setMedalleroOpen(true)} 
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Medal className="mr-2 h-4 w-4" />
            Ver Medallero
          </Button>
          <Button 
            onClick={() => setFormOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Nueva Competencia
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Total Competencias</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Mejores Tiempos</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900">{stats.personalBests}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Medal className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-700">Medallas</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900">{stats.medals}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Tiempo Promedio</h3>
          </div>
          <p className="text-2xl font-bold mt-2 text-gray-900">
            {stats.avgTime > 0 ? formatTime(stats.avgTime) : '—'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por competencia o nadador..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 bg-white"
          />
        </div>
        <Select
          value={filters.swimmer}
          onValueChange={(value) => setFilters({ ...filters, swimmer: value })}
        >
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Todos los nadadores" />
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
          onValueChange={(value) => setFilters({ ...filters, style: value })}
        >
          <SelectTrigger className="w-full sm:w-48 bg-white">
            <SelectValue placeholder="Todos los estilos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estilos</SelectItem>
            {styles.map((style) => (
              <SelectItem key={style.style} value={style.style}>
                {style.nameEs}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Competitions Table */}
      <div className="rounded-lg border bg-white shadow-sm">
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
              {filteredCompetitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Trophy className="h-12 w-12 text-gray-300" />
                      <div>
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
                  </td>
                </tr>
              ) : (
                filteredCompetitions.map((competition) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
  );
}
