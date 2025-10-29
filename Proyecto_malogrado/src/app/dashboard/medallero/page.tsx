"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Calendar, Target } from "lucide-react";

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
  };
}

interface Swimmer {
  id: string;
  name: string;
}

interface MedalStats {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface CompetitionWithMedals {
  competition: string;
  date: string;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

export default function MedalleroPage() {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedSwimmer, setSelectedSwimmer] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMedalFilter, setSelectedMedalFilter] = useState<'ALL' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSwimmers();
    fetchCompetitions();
  }, []);

  const fetchSwimmers = async () => {
    try {
      const response = await fetch('/api/swimmers');
      if (response.ok) {
        const data = await response.json();
        setSwimmers(data);
        if (data.length > 0) {
          setSelectedSwimmer(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching swimmers:', error);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions');
      if (response.ok) {
        const data = await response.json();
        setCompetitions(data);
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar competiciones por nadador y año
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSwimmer = comp.child.id === selectedSwimmer;
    const competitionYear = new Date(comp.date).getFullYear().toString();
    const matchesYear = selectedYear === 'all' || competitionYear === selectedYear;
    
    return matchesSwimmer && matchesYear && comp.medal && comp.medal !== 'NONE';
  });

  // Calcular estadísticas de medallas
  const medalStats: MedalStats = filteredCompetitions.reduce(
    (stats, comp) => {
      if (comp.medal === 'GOLD') stats.gold++;
      else if (comp.medal === 'SILVER') stats.silver++;
      else if (comp.medal === 'BRONZE') stats.bronze++;
      return stats;
    },
    { gold: 0, silver: 0, bronze: 0, total: 0 }
  );
  medalStats.total = medalStats.gold + medalStats.silver + medalStats.bronze;

  // Agrupar medallas por competencia (con filtro de tipo de medalla)
  const competitionMedals: CompetitionWithMedals[] = [];
  const competitionMap = new Map<string, { competition: string; date: string; medals: { gold: number; silver: number; bronze: number } }>();

  filteredCompetitions.forEach((comp) => {
    const key = `${comp.competition}-${comp.date}`;
    if (!competitionMap.has(key)) {
      competitionMap.set(key, {
        competition: comp.competition,
        date: comp.date,
        medals: { gold: 0, silver: 0, bronze: 0 }
      });
    }
    
    const entry = competitionMap.get(key)!;
    if (comp.medal === 'GOLD') entry.medals.gold++;
    else if (comp.medal === 'SILVER') entry.medals.silver++;
    else if (comp.medal === 'BRONZE') entry.medals.bronze++;
  });

  // Filtrar competiciones según el filtro de medalla seleccionado
  const filteredCompetitionMedals = Array.from(competitionMap.values()).filter((comp) => {
    if (selectedMedalFilter === 'ALL') return true;
    if (selectedMedalFilter === 'GOLD') return comp.medals.gold > 0;
    if (selectedMedalFilter === 'SILVER') return comp.medals.silver > 0;
    if (selectedMedalFilter === 'BRONZE') return comp.medals.bronze > 0;
    return true;
  });

  competitionMedals.push(...filteredCompetitionMedals);
  competitionMedals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Obtener años únicos
  const availableYears = [...new Set(competitions.map(comp => new Date(comp.date).getFullYear().toString()))].sort().reverse();

  const selectedSwimmerName = swimmers.find(s => s.id === selectedSwimmer)?.name || "";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medallero</h1>
          <p className="text-muted-foreground">Cargando medallero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🏆 Medallero</h1>
        <p className="text-muted-foreground">Historial de medallas obtenidas en competencias</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nadador</label>
          <Select value={selectedSwimmer} onValueChange={setSelectedSwimmer}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecciona un nadador" />
            </SelectTrigger>
            <SelectContent>
              {swimmers.map((swimmer) => (
                <SelectItem key={swimmer.id} value={swimmer.id}>
                  {swimmer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Año</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSwimmer && (
        <>
          {/* Estadísticas de medallas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {selectedSwimmerName} - Resumen de medallas
                {selectedYear !== 'all' && ` (${selectedYear})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                  className={`text-center p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMedalFilter === 'GOLD' ? 'bg-yellow-100 border-yellow-300 shadow-md' : 'bg-yellow-50'
                  }`}
                  onClick={() => setSelectedMedalFilter(selectedMedalFilter === 'GOLD' ? 'ALL' : 'GOLD')}
                >
                  <div className="text-3xl font-bold text-yellow-600">{medalStats.gold}</div>
                  <div className="text-sm text-yellow-600 flex items-center justify-center gap-1">
                    <span>🥇</span> Oro
                  </div>
                </div>
                <div 
                  className={`text-center p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMedalFilter === 'SILVER' ? 'bg-gray-100 border-gray-300 shadow-md' : 'bg-gray-50'
                  }`}
                  onClick={() => setSelectedMedalFilter(selectedMedalFilter === 'SILVER' ? 'ALL' : 'SILVER')}
                >
                  <div className="text-3xl font-bold text-gray-600">{medalStats.silver}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <span>🥈</span> Plata
                  </div>
                </div>
                <div 
                  className={`text-center p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMedalFilter === 'BRONZE' ? 'bg-orange-100 border-orange-300 shadow-md' : 'bg-orange-50'
                  }`}
                  onClick={() => setSelectedMedalFilter(selectedMedalFilter === 'BRONZE' ? 'ALL' : 'BRONZE')}
                >
                  <div className="text-3xl font-bold text-orange-600">{medalStats.bronze}</div>
                  <div className="text-sm text-orange-600 flex items-center justify-center gap-1">
                    <span>🥉</span> Bronce
                  </div>
                </div>
                <div 
                  className={`text-center p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedMedalFilter === 'ALL' ? 'bg-blue-100 border-blue-300 shadow-md' : 'bg-blue-50'
                  }`}
                  onClick={() => setSelectedMedalFilter('ALL')}
                >
                  <div className="text-3xl font-bold text-blue-600">{medalStats.total}</div>
                  <div className="text-sm text-blue-600 flex items-center justify-center gap-1">
                    <Medal className="h-4 w-4" /> Total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial por competencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Historial por competencia
                {selectedMedalFilter !== 'ALL' && (
                  <Badge variant="outline" className="ml-2">
                    {selectedMedalFilter === 'GOLD' && '🥇 Solo medallas de oro'}
                    {selectedMedalFilter === 'SILVER' && '🥈 Solo medallas de plata'}
                    {selectedMedalFilter === 'BRONZE' && '🥉 Solo medallas de bronce'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competitionMedals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay medallas registradas</p>
                  <p className="text-sm">
                    {selectedYear !== 'all' ? `para el año ${selectedYear}` : 'para este nadador'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {competitionMedals.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{comp.competition}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(comp.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {comp.medals.gold > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            🥇 {comp.medals.gold}
                          </Badge>
                        )}
                        {comp.medals.silver > 0 && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            🥈 {comp.medals.silver}
                          </Badge>
                        )}
                        {comp.medals.bronze > 0 && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            🥉 {comp.medals.bronze}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {swimmers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No hay nadadores registrados</p>
            <p className="text-sm text-muted-foreground">Agrega nadadores para ver su medallero</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}