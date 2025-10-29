'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Clock, 
  MapPin, 
  Calendar, 
  Medal, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  TrendingUp,
  Star,
  Info,
  Heart,
  Award,
  Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  club: string;
  category: string;
  times: FDPNTime[];
}

interface FDPNSummary {
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
}

interface FDPNSearchResult {
  swimmer: any;
  fdpnData: FDPNData;
  searchName: string;
  found: boolean;
  summary: FDPNSummary;
}

interface FDPNIntegrationProps {
  swimmerId: string;
  swimmerName: string;
  onDataUpdated?: (data: FDPNData) => void;
  showFullInterface?: boolean; // Nueva prop para controlar la interfaz completa
}

const FDPNIntegration: React.FC<FDPNIntegrationProps> = ({ 
  swimmerId, 
  swimmerName, 
  onDataUpdated,
  showFullInterface = false 
}) => {
  const [searchResult, setSearchResult] = useState<FDPNSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const searchInFDPN = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/fdpn/swimmers?swimmerId=${swimmerId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al buscar en FDPN');
      }

      const data = await response.json();
      setSearchResult(data);
      setLastSync(new Date().toLocaleString());
      
      if (data.found && data.fdpnData) {
        onDataUpdated?.(data.fdpnData);
        toast.success(`✅ ¡Encontrado! ${data.summary.totalTimes} tiempos oficiales`);
      } else {
        setError('No se encontraron datos en FDPN para este nadador');
        toast.error('❌ No se encontraron datos en FDPN');
      }

    } catch (err) {
      console.error('Error searching FDPN:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
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

  // Interfaz simplificada para perfiles de nadadores
  if (!showFullInterface) {
    return (
      <div className="space-y-4">
        {/* Header con botón de búsqueda */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                Resultados FDPN
              </CardTitle>
              <Button
                onClick={searchInFDPN}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
            {lastSync && (
              <p className="text-sm text-gray-500">
                Última búsqueda: {lastSync}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Resultados condensados */}
        {searchResult && searchResult.found && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  ¡Encontrado! {searchResult.summary.totalTimes} tiempos oficiales
                </span>
              </div>
              
              {searchResult.summary.personalBests.slice(0, 3).map((pb, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-green-200 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(pb.event)}</span>
                    <span className="font-medium text-green-900">{pb.event}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{pb.bestTime}</div>
                    {pb.place && (
                      <Badge className={getPlaceColor(pb.place)}>
                        {pb.place}°
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-3 pt-3 border-t border-green-200">
                <a
                  href="/dashboard/fdpn"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver todos los resultados en FDPN
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
              <div className="mt-3 text-sm text-orange-600">
                <p>💡 <strong>Tip:</strong> El nadador podría no estar registrado en competencias oficiales aún.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado inicial */}
        {!searchResult && !error && !loading && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Buscar en FDPN
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Busca los tiempos oficiales de {swimmerName} en la Federación Peruana de Natación
                  </p>
                  <Button onClick={searchInFDPN} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Ahora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Interfaz completa - redirigir a la página dedicada
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <ExternalLink className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Consulta Completa FDPN
              </h3>
              <p className="text-gray-600 mb-4">
                Para una experiencia completa de búsqueda y análisis de tiempos oficiales, 
                visita nuestra página dedicada con todas las funcionalidades.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/dashboard/fdpn">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a FDPN Completo
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FDPNIntegration;