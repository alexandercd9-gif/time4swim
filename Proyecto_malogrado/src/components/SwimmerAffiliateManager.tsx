'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Save, 
  X, 
  Users, 
  Trophy, 
  ExternalLink,
  Star,
  Search,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Swimmer {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  fdpnAffiliateCode?: string;
  club?: {
    name: string;
  };
  _count: {
    records: number;
    trainings: number;
  };
}

const SwimmerAffiliateManager: React.FC = () => {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCodes, setTempCodes] = useState<{ [key: string]: string }>({});
  const [searching, setSearching] = useState<{ [key: string]: boolean }>({});

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
      toast.error('Error al cargar nadadores');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (swimmerId: string, currentCode: string) => {
    setEditingId(swimmerId);
    setTempCodes({ ...tempCodes, [swimmerId]: currentCode || '' });
  };

  const handleCancel = (swimmerId: string) => {
    setEditingId(null);
    const newTempCodes = { ...tempCodes };
    delete newTempCodes[swimmerId];
    setTempCodes(newTempCodes);
  };

  const handleSave = async (swimmerId: string) => {
    try {
      const newCode = tempCodes[swimmerId]?.trim();
      
      const response = await fetch(`/api/swimmers/${swimmerId}/affiliate-code`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ fdpnAffiliateCode: newCode || null })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar código de afiliado');
      }

      // Actualizar estado local
      setSwimmers(swimmers.map(s => 
        s.id === swimmerId 
          ? { ...s, fdpnAffiliateCode: newCode || undefined }
          : s
      ));

      setEditingId(null);
      const newTempCodes = { ...tempCodes };
      delete newTempCodes[swimmerId];
      setTempCodes(newTempCodes);

      toast.success('Código de afiliado actualizado');

    } catch (error) {
      console.error('Error saving affiliate code:', error);
      toast.error('Error al guardar código de afiliado');
    }
  };

  const testFDPNSearch = async (swimmerId: string, affiliateCode: string) => {
    if (!affiliateCode?.trim()) {
      toast.error('Ingresa un código de afiliado para probar');
      return;
    }

    try {
      setSearching({ ...searching, [swimmerId]: true });
      
      const params = new URLSearchParams({
        affiliateCode: affiliateCode.trim(),
        swimmerId: swimmerId
      });

      const response = await fetch(`/api/fdpn/swimmers?${params}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.fdpnData?.name) {
        toast.success(`✅ Encontrado: ${data.fdpnData.name} - ${data.fdpnData.club}`);
      } else {
        toast.error('❌ No se encontraron resultados con este código');
      }

    } catch (error) {
      console.error('Error testing FDPN search:', error);
      toast.error('Error al probar búsqueda FDPN');
    } finally {
      setSearching({ ...searching, [swimmerId]: false });
    }
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Cargando nadadores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                🏊‍♀️ Gestión de Códigos de Afiliado FDPN
              </CardTitle>
              <p className="text-blue-100 text-lg">
                Asocia códigos oficiales a tus nadadores para búsquedas más precisas
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 mt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-0.5 text-blue-200" />
              <div className="text-sm text-blue-100">
                <p className="font-medium mb-1">💡 ¿Para qué sirve?</p>
                <p>Los códigos de afiliado FDPN permiten encontrar los tiempos oficiales de competencias 
                de manera más rápida y precisa. Si tu hijo ya compite oficialmente, puedes obtener 
                este código de documentos de competencias o consultar con su entrenador.</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de nadadores */}
      <div className="grid gap-4">
        {swimmers.map((swimmer) => {
          const isEditing = editingId === swimmer.id;
          const age = getAgeFromBirthDate(swimmer.birthDate);
          const currentCode = swimmer.fdpnAffiliateCode;
          const tempCode = tempCodes[swimmer.id];
          const isSearching = searching[swimmer.id];

          return (
            <Card key={swimmer.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {swimmer.name.charAt(0)}
                    </div>
                    
                    {/* Info del nadador */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{swimmer.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {age} años
                        </Badge>
                        {swimmer.gender === 'MALE' ? '👦' : '👧'}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {swimmer.club && (
                          <span className="flex items-center gap-1">
                            🏊‍♀️ {swimmer.club.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {swimmer._count.records} récords
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {swimmer._count.trainings} entrenamientos
                        </span>
                      </div>

                      {/* Código de afiliado */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Código de Afiliado FDPN:
                        </label>
                        
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="Ej: 79272554"
                              value={tempCode || ''}
                              onChange={(e) => setTempCodes({
                                ...tempCodes,
                                [swimmer.id]: e.target.value
                              })}
                              className="font-mono max-w-xs"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSave(swimmer.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(swimmer.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {currentCode ? (
                              <div className="flex items-center gap-2">
                                <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                                  {currentCode}
                                </code>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-xs text-green-600">Configurado</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 italic">No configurado</span>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              </div>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(swimmer.id, currentCode || '')}
                              className="ml-2"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {currentCode ? 'Editar' : 'Agregar'}
                            </Button>

                            {currentCode && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testFDPNSearch(swimmer.id, currentCode)}
                                disabled={isSearching}
                                className="bg-blue-50 hover:bg-blue-100"
                              >
                                {isSearching ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-1"></div>
                                    Probando...
                                  </>
                                ) : (
                                  <>
                                    <Search className="h-4 w-4 mr-1" />
                                    Probar Búsqueda
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {swimmers.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay nadadores registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega nadadores primero para poder gestionar sus códigos de afiliado FDPN
            </p>
            <Button asChild>
              <a href="/dashboard/swimmers">
                <Users className="h-4 w-4 mr-2" />
                Agregar Nadadores
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SwimmerAffiliateManager;