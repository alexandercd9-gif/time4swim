'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Star,
  X,
  ChevronRight,
  Heart,
  Trophy,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Alert {
  id: string;
  type: 'success' | 'info' | 'reminder' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  childId: string;
  childName: string;
  action: {
    type: string;
    label: string;
    url: string;
  };
  createdAt: string;
}

interface AlertSummary {
  byType: {
    success: number;
    info: number;
    reminder: number;
    tip: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

interface ParentAlertsProps {
  showCompact?: boolean; // Para mostrar versión compacta en el dashboard
  childId?: string; // Para filtrar por un hijo específico
}

const ParentAlerts: React.FC<ParentAlertsProps> = ({ 
  showCompact = false, 
  childId 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
  }, [childId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (childId) {
        params.append('childId', childId);
      }

      const response = await fetch(`/api/parent/alerts?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar alertas');
      }

      const data = await response.json();
      setAlerts(data.alerts);
      setSummary(data.summary);

    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    toast.success('Notificación marcada como leída');
  };

  const handleAlertAction = async (alert: Alert) => {
    try {
      const response = await fetch('/api/parent/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          alertId: alert.id,
          action: alert.action.type
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar acción');
      }

      const data = await response.json();
      
      if (data.result?.redirect) {
        window.location.href = data.result.redirect;
      } else {
        toast.success('Acción completada');
        handleDismissAlert(alert.id);
      }

    } catch (error) {
      console.error('Error processing alert action:', error);
      toast.error('Error al procesar la acción');
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <Trophy className="h-5 w-5 text-green-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case 'tip':
        return <Star className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: Alert['type'], priority: Alert['priority']) => {
    const baseColors = {
      success: 'bg-green-50 border-green-200',
      info: 'bg-blue-50 border-blue-200',
      reminder: 'bg-orange-50 border-orange-200',
      tip: 'bg-purple-50 border-purple-200'
    };

    const priorityStyles = {
      high: 'ring-2 ring-red-200 shadow-md',
      medium: 'ring-1 ring-yellow-200',
      low: ''
    };

    return `${baseColors[type]} ${priorityStyles[priority]}`;
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      high: '🔥 Urgente',
      medium: '⚡ Importante',
      low: '💡 Info'
    };

    return (
      <Badge className={styles[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Versión compacta para el dashboard
  if (showCompact) {
    const highPriorityAlerts = visibleAlerts.filter(alert => alert.priority === 'high').slice(0, 3);

    if (highPriorityAlerts.length === 0) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">
              ¡Todo al día! 👏
            </p>
            <p className="text-xs text-green-600">
              No hay notificaciones urgentes
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notificaciones ({highPriorityAlerts.length})
            </span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/notifications">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {highPriorityAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertColor(alert.type, alert.priority)}`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{alert.childName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAlertAction(alert)}
                    >
                      {alert.action.label}
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDismissAlert(alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Versión completa
  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bell className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                🔔 Notificaciones para Padres
              </CardTitle>
              <p className="text-blue-100 text-lg">
                Mantente al día con el progreso de tus nadadores
              </p>
            </div>
          </div>
          
          {summary && (
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{summary.byPriority.high}</div>
                  <div className="text-xs text-blue-200">Urgentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.byType.success}</div>
                  <div className="text-xs text-blue-200">Logros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.byType.reminder}</div>
                  <div className="text-xs text-blue-200">Recordatorios</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summary.byType.tip}</div>
                  <div className="text-xs text-blue-200">Consejos</div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Alertas */}
      {visibleAlerts.length > 0 ? (
        <div className="space-y-4">
          {visibleAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-2 ${getAlertColor(alert.type, alert.priority)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {alert.childName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          Marcar como leída
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAlertAction(alert)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {alert.action.label}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              ¡Todo al día! 🎉
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              No tienes notificaciones pendientes. Sigue apoyando a tus nadadores.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-blue-50 p-4 rounded-xl">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900 mb-1">Progreso</h4>
                <p className="text-sm text-blue-700">
                  Revisa los avances de tus hijos
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-1">FDPN</h4>
                <p className="text-sm text-green-700">
                  Busca resultados oficiales
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900 mb-1">Entrenar</h4>
                <p className="text-sm text-purple-700">
                  Registra nuevas sesiones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentAlerts;