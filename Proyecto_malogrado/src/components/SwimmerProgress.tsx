'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  Trophy,
  Clock,
  Star,
  Info,
  Zap,
  ChevronRight,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LocalTime {
  id: string;
  event: string;
  time: string;
  date: string;
  isPersonalBest?: boolean;
}

interface FDPNTime {
  event: string;
  time: string;
  date: string;
  competition: string;
  place: string;
}

interface TimeComparison {
  event: string;
  localTime: LocalTime | null;
  fdpnTime: FDPNTime | null;
  difference: number | null; // En segundos - positivo significa que local es más lento
  improvement: 'better' | 'worse' | 'similar' | null;
  recommendation: string;
}

interface SwimmerProgressProps {
  swimmerId: string;
  swimmerName: string;
  fdpnTimes?: FDPNTime[];
}

const SwimmerProgress: React.FC<SwimmerProgressProps> = ({ 
  swimmerId, 
  swimmerName,
  fdpnTimes = []
}) => {
  const [localTimes, setLocalTimes] = useState<LocalTime[]>([]);
  const [comparisons, setComparisons] = useState<TimeComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadLocalTimes();
  }, [swimmerId]);

  useEffect(() => {
    if (localTimes.length > 0 || fdpnTimes.length > 0) {
      generateComparisons();
    }
  }, [localTimes, fdpnTimes]);

  const loadLocalTimes = async () => {
    try {
      setLoading(true);
      
      // Simular carga de tiempos locales desde la API
      // En un caso real, esto vendría de la base de datos
      const mockLocalTimes: LocalTime[] = [
        {
          id: '1',
          event: '50m Libre',
          time: '28.50',
          date: '2024-10-15',
          isPersonalBest: true
        },
        {
          id: '2',
          event: '100m Libre',
          time: '1:02.30',
          date: '2024-10-10',
          isPersonalBest: true
        },
        {
          id: '3',
          event: '50m Espalda',
          time: '32.80',
          date: '2024-09-28',
          isPersonalBest: false
        }
      ];

      setLocalTimes(mockLocalTimes);
    } catch (error) {
      console.error('Error loading local times:', error);
      toast.error('Error al cargar tiempos locales');
    } finally {
      setLoading(false);
    }
  };

  const generateComparisons = () => {
    const allEvents = new Set([
      ...localTimes.map(t => t.event),
      ...fdpnTimes.map(t => t.event)
    ]);

    const newComparisons: TimeComparison[] = Array.from(allEvents).map(event => {
      const localTime = localTimes.find(t => t.event === event) || null;
      const fdpnTime = fdpnTimes.find(t => t.event === event) || null;
      
      let difference: number | null = null;
      let improvement: TimeComparison['improvement'] = null;
      let recommendation = '';

      if (localTime && fdpnTime) {
        const localSeconds = convertTimeToSeconds(localTime.time);
        const fdpnSeconds = convertTimeToSeconds(fdpnTime.time);
        difference = localSeconds - fdpnSeconds;

        if (Math.abs(difference) < 0.5) {
          improvement = 'similar';
          recommendation = '¡Excelente! Está muy cerca del tiempo oficial. Sigue entrenando para mejorar la técnica.';
        } else if (difference < 0) {
          improvement = 'better';
          recommendation = '¡Increíble! Tu tiempo local es mejor que el oficial registrado. ¡Considera participar en competencias!';
        } else {
          improvement = 'worse';
          recommendation = 'Hay margen de mejora. Enfócate en técnica y entrenamiento específico para este estilo.';
        }
      } else if (localTime && !fdpnTime) {
        recommendation = 'Solo tienes tiempos de entrenamiento. ¡Hora de competir oficialmente!';
      } else if (!localTime && fdpnTime) {
        recommendation = 'Tienes un tiempo oficial registrado. ¡Entrena este estilo para mejorar!';
      }

      return {
        event,
        localTime,
        fdpnTime,
        difference,
        improvement,
        recommendation
      };
    });

    setComparisons(newComparisons.sort((a, b) => a.event.localeCompare(b.event)));
  };

  const convertTimeToSeconds = (timeStr: string): number => {
    if (timeStr.includes(':')) {
      const [minutes, seconds] = timeStr.split(':');
      return parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return parseFloat(timeStr);
  };

  const formatTimeDifference = (difference: number): string => {
    const abs = Math.abs(difference);
    const sign = difference > 0 ? '+' : '-';
    return `${sign}${abs.toFixed(2)}s`;
  };

  const getImprovementIcon = (improvement: TimeComparison['improvement']) => {
    switch (improvement) {
      case 'better':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'worse':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'similar':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getImprovementColor = (improvement: TimeComparison['improvement']) => {
    switch (improvement) {
      case 'better':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'worse':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'similar':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes('Libre')) return '🏊‍♂️';
    if (event.includes('Espalda')) return '🏊‍♀️';
    if (event.includes('Pecho')) return '🏊';
    if (event.includes('Mariposa')) return '🦋';
    if (event.includes('Medley')) return '🏆';
    return '⏱️';
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando progreso...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                📊 Análisis de Progreso
              </CardTitle>
              <p className="text-purple-100 text-lg">
                Comparando tiempos de entrenamiento vs competencias oficiales
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 mt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-purple-200" />
              <div className="text-sm text-purple-100">
                <p className="font-medium mb-1">💡 ¿Cómo interpretar esto?</p>
                <p>Este análisis compara los mejores tiempos de entrenamiento con los resultados oficiales registrados en FDPN. 
                Te ayuda a identificar oportunidades de mejora y celebrar los logros de tu nadador.</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen de progreso */}
      {comparisons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-2xl font-bold text-green-800">
                {comparisons.filter(c => c.improvement === 'better').length}
              </div>
              <div className="text-sm text-green-600">
                Mejor que oficial
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-yellow-800">
                {comparisons.filter(c => c.improvement === 'similar').length}
              </div>
              <div className="text-sm text-yellow-600">
                Muy cerca del objetivo
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-blue-800">
                {comparisons.filter(c => c.improvement === 'worse' || c.improvement === null).length}
              </div>
              <div className="text-sm text-blue-600">
                Oportunidades de mejora
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparaciones detalladas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Comparación Detallada por Evento
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ver menos' : 'Ver detalles'}
              <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border-2 ${getImprovementColor(comparison.improvement)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEventIcon(comparison.event)}</span>
                    <div>
                      <h4 className="font-semibold text-lg">{comparison.event}</h4>
                      <div className="flex items-center gap-2">
                        {getImprovementIcon(comparison.improvement)}
                        {comparison.difference !== null && (
                          <span className="text-sm font-medium">
                            {formatTimeDifference(comparison.difference)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="space-y-1">
                      {comparison.localTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-bold text-lg">{comparison.localTime.time}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Entrenamiento</span>
                        </div>
                      )}
                      {comparison.fdpnTime && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="font-bold text-lg">{comparison.fdpnTime.time}</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Oficial</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {comparison.localTime && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Mejor tiempo de entrenamiento
                          </h5>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Tiempo:</span>
                              <span className="font-bold">{comparison.localTime.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fecha:</span>
                              <span>{new Date(comparison.localTime.date).toLocaleDateString()}</span>
                            </div>
                            {comparison.localTime.isPersonalBest && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                🏆 Récord Personal
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {comparison.fdpnTime && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Tiempo oficial FDPN
                          </h5>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Tiempo:</span>
                              <span className="font-bold">{comparison.fdpnTime.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Competencia:</span>
                              <span className="text-xs">{comparison.fdpnTime.competition}</span>
                            </div>
                            {comparison.fdpnTime.place && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                {comparison.fdpnTime.place}° lugar
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Recomendación para padres
                      </h5>
                      <p className="text-sm leading-relaxed">
                        {comparison.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {comparisons.length === 0 && (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay datos para comparar
              </h3>
              <p className="text-gray-600 mb-4">
                Para ver el progreso, necesitamos tiempos de entrenamiento y/o resultados oficiales.
              </p>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Registrar tiempo de entrenamiento
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Buscar en FDPN
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consejos para padres */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            💙 Consejos para Papás y Mamás
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="space-y-2">
              <h4 className="font-semibold">🎯 Cuando los tiempos mejoran:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Celebra cada pequeño progreso</li>
                <li>• Anima a seguir con la rutina de entrenamiento</li>
                <li>• Considera inscribir en competencias</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">💪 Cuando hay oportunidades:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Enfócate en la técnica, no solo la velocidad</li>
                <li>• Habla con el entrenador sobre áreas de mejora</li>
                <li>• Mantén la motivación y diversión</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwimmerProgress;