'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, CheckCircle, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Swimmer {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fdpnLastSync?: string;
}

interface SyncResult {
  swimmerId: string;
  status: 'success' | 'error' | 'not_found';
  swimmerName: string;
  timesFound?: number;
  message?: string;
}

const FDPNMassSync: React.FC = () => {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [selectedSwimmers, setSelectedSwimmers] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSwimmers();
  }, []);

  const fetchSwimmers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/swimmers', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSwimmers(data);
      }
    } catch (error) {
      console.error('Error fetching swimmers:', error);
      toast.error('Error al cargar nadadores');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSwimmers.length === swimmers.length) {
      setSelectedSwimmers([]);
    } else {
      setSelectedSwimmers(swimmers.map(s => s.id));
    }
  };

  const handleSwimmerToggle = (swimmerId: string) => {
    setSelectedSwimmers(prev => 
      prev.includes(swimmerId)
        ? prev.filter(id => id !== swimmerId)
        : [...prev, swimmerId]
    );
  };

  const syncWithFDPN = async () => {
    if (selectedSwimmers.length === 0) {
      toast.error('Selecciona al menos un nadador');
      return;
    }

    try {
      setSyncing(true);
      setSyncResults([]);

      const response = await fetch('/api/fdpn/swimmers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          swimmerIds: selectedSwimmers
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la sincronización');
      }

      const data = await response.json();
      setSyncResults(data.results);
      
      toast.success(
        `Sincronización completada: ${data.successful} exitosos, ${data.errors} errores, ${data.notFound} no encontrados`
      );

      // Refrescar lista de nadadores
      await fetchSwimmers();

    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Error durante la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'not_found': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'not_found': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Cargando nadadores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              Sincronización Masiva con FDPN
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedSwimmers.length} de {swimmers.length} seleccionados
              </span>
              <Button
                onClick={syncWithFDPN}
                disabled={syncing || selectedSwimmers.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {syncing ? 'Sincronizando...' : 'Sincronizar Seleccionados'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de nadadores */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nadadores Registrados
            </CardTitle>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="text-sm"
            >
              {selectedSwimmers.length === swimmers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {swimmers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {swimmers.map((swimmer) => (
                <div
                  key={swimmer.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedSwimmers.includes(swimmer.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSwimmerToggle(swimmer.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSwimmers.includes(swimmer.id)}
                      onChange={() => handleSwimmerToggle(swimmer.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium">{swimmer.name}</p>
                      {swimmer.fdpnLastSync && (
                        <p className="text-xs text-gray-500">
                          Última sync: {new Date(swimmer.fdpnLastSync).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay nadadores registrados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultados de sincronización */}
      {syncResults.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Resultados de Sincronización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.swimmerName}</p>
                      {result.message && (
                        <p className="text-xs opacity-75">{result.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {result.status === 'success' && result.timesFound && (
                    <span className="text-sm font-medium">
                      {result.timesFound} tiempos encontrados
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información sobre FDPN */}
      <Card className="border-0 shadow-md bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Acerca de la integración FDPN
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Esta función busca automáticamente los tiempos oficiales de los nadadores 
                en la base de datos de la Federación Peruana de Natación.
              </p>
              <a
                href="https://www.fdpn.org/resultados/nadadores"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Ver FDPN
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FDPNMassSync;