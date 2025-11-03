"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Calendar } from "lucide-react";

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

interface MedalleroModalProps {
  isOpen: boolean;
  onClose: () => void;
  swimmers: Swimmer[];
  competitions: Competition[];
}

export default function MedalleroModal({ 
  isOpen, 
  onClose, 
  swimmers,
  competitions 
}: MedalleroModalProps) {
  const [selectedSwimmer, setSelectedSwimmer] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMedalFilter, setSelectedMedalFilter] = useState<'ALL' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');

  useEffect(() => {
    if (isOpen && swimmers.length > 0 && !selectedSwimmer) {
      setSelectedSwimmer(swimmers[0].id);
    }
  }, [isOpen, swimmers, selectedSwimmer]);

  // Filtrar competiciones por nadador y año
  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSwimmer = !selectedSwimmer || comp.child.id === selectedSwimmer;
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

  // Agrupar medallas por competencia
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

  const competitionMedals = filteredCompetitionMedals.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Medallero
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Nadador</label>
              <Select value={selectedSwimmer} onValueChange={setSelectedSwimmer}>
                <SelectTrigger>
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

            <div className="space-y-2 sm:w-32">
              <label className="text-sm font-medium">Año</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
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
                  <CardTitle className="text-lg">
                    {selectedSwimmerName} - Resumen de medallas
                    {selectedYear !== 'all' && ` (${selectedYear})`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    <div className="text-center p-4 rounded-lg border bg-blue-50">
                      <div className="text-3xl font-bold text-blue-600">{medalStats.total}</div>
                      <div className="text-sm text-blue-600 flex items-center justify-center gap-1">
                        <Medal className="h-3 w-3" /> Total
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de competencias con medallas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Competencias
                  {selectedMedalFilter !== 'ALL' && (
                    <span className="text-sm font-normal text-muted-foreground">
                      (Filtrado por {selectedMedalFilter === 'GOLD' ? '🥇 Oro' : selectedMedalFilter === 'SILVER' ? '🥈 Plata' : '🥉 Bronce'})
                    </span>
                  )}
                </h3>

                {competitionMedals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No hay medallas registradas</p>
                    {selectedMedalFilter !== 'ALL' && (
                      <p className="text-sm mt-1">Intenta con otro filtro</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {competitionMedals.map((comp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{comp.competition}</h4>
                          <p className="text-sm text-gray-500">{formatDate(comp.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {comp.medals.gold > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                              <span>🥇</span>
                              <span className="text-sm font-semibold">{comp.medals.gold}</span>
                            </div>
                          )}
                          {comp.medals.silver > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              <span>🥈</span>
                              <span className="text-sm font-semibold">{comp.medals.silver}</span>
                            </div>
                          )}
                          {comp.medals.bronze > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              <span>🥉</span>
                              <span className="text-sm font-semibold">{comp.medals.bronze}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedSwimmer && swimmers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No hay nadadores registrados</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
