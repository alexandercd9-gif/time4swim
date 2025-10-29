"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Trophy, Medal, Clock, Target, Search, Filter } from "lucide-react";
import CompetitionForm from "@/components/CompetitionForm";
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
  id: string;
  style: string;
  nameEs: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
}

interface PoolConfig {
  id: string;
  poolSize: string;
  nameEs: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [styles, setStyles] = useState<StyleConfig[]>([]);
  const [poolTypes, setPoolTypes] = useState<PoolConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
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

  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`/api/config?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setStyles(data.styles);
        setPoolTypes(data.pools);
      } else {
        console.error('Error al cargar configuraciones');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCompetitions();
    fetchSwimmers();
    fetchConfigurations();
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
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
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
    const config = poolTypes.find(p => p.poolSize === poolSize);
    return config ? config.nameEs : poolSize;
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
        {position === 1 && <Medal className="h-3 w-3 mr-1" />}
        {position === 2 && <Medal className="h-3 w-3 mr-1" />}
        {position === 3 && <Medal className="h-3 w-3 mr-1" />}
        {position}° lugar
      </span>
    );
  };

  const getMedalBadge = (medal?: string) => {
    if (!medal || medal === 'NONE') return <span className="text-sm text-gray-400">-</span>;
    
    const medals = {
      'GOLD': { emoji: '🥇', text: 'Oro', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'SILVER': { emoji: '🥈', text: 'Plata', color: 'bg-gray-100 text-gray-800 border-gray-300' },
      'BRONZE': { emoji: '🥉', text: 'Bronce', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    };
    
    const medalInfo = medals[medal as keyof typeof medals];
    if (!medalInfo) return <span className="text-sm text-gray-400">-</span>;
    
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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Competencias</h1>
            <p className="text-muted-foreground">
              Gestiona los registros de competencias
            </p>
          </div>
        </div>
        <div className="rounded-lg border p-8">
          <div className="text-center text-muted-foreground">
            <p>Cargando competencias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competencias</h1>
          <p className="text-muted-foreground">
            Gestiona los registros de competencias
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Trophy className="mr-2 h-4 w-4" />
          Nueva Competencia
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Competencias</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Mejores Tiempos</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.personalBests}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Medal className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Medallas</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.medals}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Tiempo Promedio</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.avgTime > 0 ? formatTime(stats.avgTime) : '--'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por competencia o nadador..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1"
          />
        </div>
        <Select
          value={filters.swimmer}
          onValueChange={(value) => setFilters({ ...filters, swimmer: value })}
        >
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos los estilos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estilos</SelectItem>
            <SelectItem value="FREESTYLE">Libre</SelectItem>
            <SelectItem value="BACKSTROKE">Espalda</SelectItem>
            <SelectItem value="BREASTSTROKE">Pecho</SelectItem>
            <SelectItem value="BUTTERFLY">Mariposa</SelectItem>
            <SelectItem value="INDIVIDUAL_MEDLEY">Combinado Individual</SelectItem>
            <SelectItem value="MEDLEY_RELAY">Relevo Combinado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Competitions Table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Nadador</th>
                <th className="text-left p-4 font-medium">Competencia</th>
                <th className="text-left p-4 font-medium">Estilo & Distancia</th>
                <th className="text-left p-4 font-medium">Tiempo</th>
                <th className="text-left p-4 font-medium">Posición</th>
                <th className="text-left p-4 font-medium">Medalla</th>
                <th className="text-left p-4 font-medium">Fecha</th>
                <th className="text-right p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">{/* Cambiar colSpan de 7 a 8 */}
                    <div className="flex flex-col items-center space-y-4">
                      <Trophy className="h-12 w-12 text-gray-300" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">No hay competencias registradas</h3>
                        <p className="text-gray-500 mt-1">
                          Comienza agregando la primera competencia
                        </p>
                      </div>
                      <Button onClick={() => setFormOpen(true)} className="mt-4">
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
                      <div>
                        <p className="font-medium">{competition.child.name}</p>
                        <p className="text-sm text-gray-500">{competition.child.user.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{competition.competition}</p>
                        {competition.notes && (
                          <p className="text-sm text-gray-500">{competition.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{getStyleName(competition.style)}</p>
                        <p className="text-sm text-gray-500">
                          {competition.distance >= 1000 
                            ? `${(competition.distance / 1000).toFixed(1)}km` 
                            : `${competition.distance}m`} - {getPoolSize(competition.poolSize)}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold">{formatTime(competition.time)}</span>
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
                      <span className="text-sm">{formatDate(competition.date)}</span>
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
                          className="text-red-600 hover:text-red-700"
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
    </div>
  );
}