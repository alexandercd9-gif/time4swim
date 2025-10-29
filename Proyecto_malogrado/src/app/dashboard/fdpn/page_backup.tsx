'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Trophy, 
  Clock, 
  Medal, 
  TrendingUp, 
  Star,
  ExternalLink,
  Users,
  Target,
  Award,
  Calendar,
  MapPin,
  Timer,
  Info,
  Heart,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SwimmerData {
  id: string;
  firstName: string;
  lastName: string;
}

interface FDPNTime {
  event: string;
  time: string;
  date: string;
  competition: string;
  place: string;
  pool: string;
  round: string;
}

interface FDPNData {
  name: string;
  affiliateCode: string;
  club: string;
  category: string;
  times: FDPNTime[];
}

interface FDPNSearchResult {
  fdpnData: FDPNData;
  searchName: string;
  found: boolean;
  summary: {
    totalTimes: number;
    bestEvents: Array<{
      event: string;
      time: string;
      competition: string;
      place: string;
    }>;
    lastCompetition: string;
    personalBests: Array<{
      event: string;
      bestTime: string;
      competition: string;
      date: string;
      place: string;
      improvement: number | null;
    }>;
    recentProgress: Array<{
      event: string;
      time: string;
      date: string;
      competition: string;
      place: string;
    }>;
  };
}

const FDPNDashboard: React.FC = () => {
  const [swimmers, setSwimmers] = useState<SwimmerData[]>([]);
  const [selectedSwimmer, setSelectedSwimmer] = useState<string>('');
  const [searchName, setSearchName] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [searchResults, setSearchResults] = useState<FDPNSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSwimmers, setLoadingSwimmers] = useState(true);
  const [expandedCompetitions, setExpandedCompetitions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'competitions' | 'personal-bests'>('competitions');

  // Cargar lista de nadadores al montar el componente
  useEffect(() => {
    loadSwimmers();
  }, []);

  const loadSwimmers = async () => {
    try {
      const response = await fetch('/api/children', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar nadadores');
      }

      const data = await response.json();
      setSwimmers(data.children || []);
    } catch (error) {
      console.error('Error loading swimmers:', error);
      toast.error('Error al cargar la lista de nadadores');
    } finally {
      setLoadingSwimmers(false);
    }
  };

  const searchInFDPN = async () => {
    if (!selectedSwimmer && !searchName.trim() && !affiliateCode.trim()) {
      toast.error('Por favor selecciona un nadador, escribe un nombre o un código de afiliado');
      return;
    }

    try {
      setLoading(true);
      setSearchResults(null);

      const params = new URLSearchParams();
      if (selectedSwimmer) {
        params.append('swimmerId', selectedSwimmer);
        console.log(`🔍 Búsqueda por nadador seleccionado: ${selectedSwimmer}`);
      } else {
        if (searchName.trim()) {
          params.append('name', searchName.trim());
          console.log(`📝 Búsqueda por nombre: ${searchName.trim()}`);
        }
        if (affiliateCode.trim()) {
          params.append('affiliateCode', affiliateCode.trim());
          console.log(`🔢 Búsqueda por código de afiliado: ${affiliateCode.trim()}`);
        }
      }

      console.log(`🌐 URL completa: /api/fdpn/swimmers?${params}`);

      const response = await fetch(`/api/fdpn/swimmers?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al buscar en FDPN');
      }

      const data = await response.json();
      setSearchResults(data);

      if (data.found) {
        toast.success(`✅ Encontrado! ${data.summary.totalTimes} tiempos oficiales`);
      } else {
        toast.error('❌ No se encontraron datos en FDPN');
      }

    } catch (error) {
      console.error('Error searching FDPN:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes('Libre') || event.includes('Free')) return '🏊‍♂️';
    if (event.includes('Espalda') || event.includes('Back')) return '🏊‍♀️';
    if (event.includes('Pecho') || event.includes('Breast')) return '🏊';
    if (event.includes('Mariposa') || event.includes('Butterfly')) return '🦋';
    if (event.includes('Medley') || event.includes('Individual')) return '🏆';
    return '⏱️';
  };

  const getPlaceColor = (place: string) => {
    const placeNum = parseInt(place);
    if (placeNum === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (placeNum === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (placeNum === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (placeNum <= 8) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const formatImprovement = (improvement: number | null) => {
    if (!improvement) return null;
    const sign = improvement > 0 ? '-' : '+';
    return `${sign}${Math.abs(improvement).toFixed(2)}s`;
  };

  // Agrupar tiempos por competencia
  const groupTimesByCompetition = (times: any[]) => {
    const grouped = times.reduce((acc, time) => {
      if (!acc[time.competition]) {
        acc[time.competition] = {
          competition: time.competition,
          date: time.date,
          times: []
        };
      }
      acc[time.competition].times.push(time);
      return acc;
    }, {});

    // Ordenar por fecha (más reciente primero)
    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Obtener mejores marcas personales por evento
  const getPersonalBests = (times: any[]) => {
    const eventBests = times.reduce((acc, time) => {
      if (!acc[time.event] || timeToSeconds(time.time) < timeToSeconds(acc[time.event].time)) {
        acc[time.event] = time;
      }
      return acc;
    }, {});

    return Object.values(eventBests).sort((a: any, b: any) => a.event.localeCompare(b.event));
  };

  // Convertir tiempo a segundos para comparación
  const timeToSeconds = (time: string) => {
    const parts = time.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(time);
  };

  // Toggle expansión de competencia
  const toggleCompetitionExpansion = (competition: string) => {
    const newExpanded = new Set(expandedCompetitions);
    if (newExpanded.has(competition)) {
      newExpanded.delete(competition);
    } else {
      newExpanded.add(competition);
    }
    setExpandedCompetitions(newExpanded);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tiempos Oficiales FDPN</h1>
            <p className="text-blue-100 text-lg">
              Consulta los resultados oficiales de la Federación Peruana de Natación
            </p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 text-blue-200" />
            <div className="text-sm text-blue-100">
              <p className="font-medium mb-1">💡 ¿Para qué sirve esto?</p>
              <p>Aquí puedes buscar los tiempos oficiales de tu nadador registrados en competencias nacionales. 
              Esto te ayuda a ver su progreso y comparar con otros competidores del país.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Nadador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleccionar de la lista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏊‍♂️ Seleccionar de mis nadadores
              </label>
              {loadingSwimmers ? (
                <div className="text-gray-500">Cargando nadadores...</div>
              ) : (
                <select
                  value={selectedSwimmer}
                  onChange={(e) => {
                    setSelectedSwimmer(e.target.value);
                    if (e.target.value) {
                      setSearchName('');
                      setAffiliateCode('');
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar nadador...</option>
                  {swimmers.map((swimmer) => (
                    <option key={swimmer.id} value={swimmer.id}>
                      {swimmer.firstName} {swimmer.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* O buscar por código de afiliado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔢 Código de Afiliado FDPN
              </label>
              <Input
                type="text"
                placeholder="Ej: 79272554"
                value={affiliateCode}
                onChange={(e) => {
                  setAffiliateCode(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedSwimmer('');
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Buscar por nombre libre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 O buscar por nombre completo
            </label>
            <Input
              type="text"
              placeholder="Ej: Liam Casaverde"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedSwimmer('');
                }
              }}
              className="w-full"
            />
          </div>

          <Button
            onClick={searchInFDPN}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Buscando en FDPN...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar en FDPN
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {searchResults && (
        <div className="space-y-6">
          {searchResults.found ? (
            <>
              {/* Resumen del nadador */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-6 w-6" />
                      ¡Nadador Encontrado!
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {searchResults.summary.totalTimes} tiempos oficiales
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-2xl mb-2">👨‍🏊</div>
                      <div className="font-semibold text-gray-900">{searchResults.fdpnData.name}</div>
                      <div className="text-sm text-gray-600">{searchResults.fdpnData.club}</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-semibold text-gray-900">{searchResults.summary.totalTimes}</div>
                      <div className="text-sm text-gray-600">Tiempos Registrados</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl">
                      <div className="text-2xl mb-2">📅</div>
                      <div className="font-semibold text-gray-900">{searchResults.fdpnData.category}</div>
                      <div className="text-sm text-gray-600">Categoría</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sistema de Pestañas */}
              <div className="space-y-4">
                {/* Pestañas de navegación */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('competitions')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'competitions'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      🏊‍♂️ Competencias Federativas
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('personal-bests')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'personal-bests'
                        ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      🏆 Mejores Marcas Personales
                    </div>
                  </button>
                </div>

                {/* Contenido de las pestañas */}
                {activeTab === 'competitions' && searchResults.fdpnData.times && searchResults.fdpnData.times.length > 0 && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        📊 Historial por Competencias ({searchResults.fdpnData.times.length} tiempos oficiales)
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        🏊‍♂️ Aquí puedes ver todas las competencias en las que ha participado. 
                        Haz click en cada competencia para ver los tiempos detallados.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {groupTimesByCompetition(searchResults.fdpnData.times).map((comp: any, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Header de la competencia */}
                            <button
                              onClick={() => toggleCompetitionExpansion(comp.competition)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <Trophy className="h-5 w-5 text-blue-500" />
                                <div>
                                  <h3 className="font-medium text-gray-900">{comp.competition}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {comp.date}
                                    </span>
                                    <span className="text-blue-600">
                                      {comp.times.length} evento{comp.times.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {comp.times.length} tiempos
                                </Badge>
                                {expandedCompetitions.has(comp.competition) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </div>
                            </button>

                            {/* Contenido expandible */}
                            {expandedCompetitions.has(comp.competition) && (
                              <div className="p-4 bg-white border-t border-gray-200">
                                <div className="space-y-3">
                                  {comp.times.map((time: any, timeIndex: number) => (
                                    <div key={timeIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">{getEventIcon(time.event)}</span>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{time.event}</h4>
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Badge variant="outline" className="text-xs">
                                              {time.pool} • {time.round}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600">{time.time}</div>
                                        {time.place && (
                                          <Badge className={getPlaceColor(time.place)}>
                                            {time.place}° lugar
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'personal-bests' && searchResults.fdpnData.times && searchResults.fdpnData.times.length > 0 && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        🏆 Mejores Marcas Personales
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        ⭐ Aquí están los mejores tiempos de tu nadador en cada evento. 
                        Son los récords personales que ha logrado hasta la fecha.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getPersonalBests(searchResults.fdpnData.times).map((pb: any, index) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{getEventIcon(pb.event)}</span>
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">{pb.event}</h4>
                                  <div className="text-2xl font-bold text-orange-600 mb-2">{pb.time}</div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {pb.competition}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {pb.date}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {pb.place && (
                                  <Badge className={getPlaceColor(pb.place)}>
                                    {pb.place}° lugar
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Link a FDPN */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <ExternalLink className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ver más en la web oficial
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Consulta todos los resultados y estadísticas en el sitio web de la Federación Peruana de Natación
                      </p>
                      <a
                        href="https://www.fdpn.org/resultados/nadadores"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ir a FDPN.org
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* No encontrado */
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-orange-700 mb-4">
                      No encontramos tiempos oficiales para <strong>{searchResults.searchName}</strong> en la base de datos de FDPN.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800">
                        <strong>💡 Posibles razones:</strong><br />
                        • El nadador aún no ha participado en competencias oficiales<br />
                        • Los datos pueden estar bajo un nombre ligeramente diferente<br />
                        • La información aún no se ha actualizado en FDPN
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Información adicional */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <BookOpen className="h-5 w-5" />
            💡 ¿Qué es FDPN?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-indigo-700">
            <p>
              <strong>FDPN</strong> es la Federación Deportiva Nacional del Perú, el organismo oficial que 
              regula la natación competitiva en el país. Aquí se registran todos los tiempos oficiales 
              de competencias nacionales e internacionales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">Para Padres</span>
                </div>
                <p className="text-xs">
                  Te ayuda a seguir el progreso oficial de tu hijo/a en competencias nacionales
                  y comparar con otros nadadores del país.
                </p>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">Para Entrenadores</span>
                </div>
                <p className="text-xs">
                  Información oficial para evaluar rendimiento, planificar entrenamientos 
                  y establecer objetivos competitivos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FDPNDashboard;