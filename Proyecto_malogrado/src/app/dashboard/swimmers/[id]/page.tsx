'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, MapPin, Trophy, Activity, Users, Clock } from 'lucide-react';
import FDPNIntegration from '@/components/FDPNIntegration';
import SwimmerProgress from '@/components/SwimmerProgress';
import { toast } from 'react-hot-toast';

interface SwimmerDetail {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate: string;
  gender: string;
  coach?: string;
  photo?: string;
  club?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  records: Array<{
    id: string;
    style: string;
    poolSize: string;
    competition: string;
    date: string;
    distance: number;
    time: number;
    medal?: string;
  }>;
  trainings: Array<{
    id: string;
    date: string;
    duration: number;
    style: string;
    distance: number;
    notes?: string;
  }>;
  fdpnData?: string;
  fdpnLastSync?: string;
}

export default function SwimmerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const swimmerId = params?.id as string;
  
  const [swimmer, setSwimmer] = useState<SwimmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (swimmerId) {
      fetchSwimmerDetail();
    }
  }, [swimmerId]);

  const fetchSwimmerDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/swimmers/${swimmerId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar detalles del nadador');
      }

      const data = await response.json();
      setSwimmer(data);
    } catch (err) {
      console.error('Error fetching swimmer:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar detalles del nadador');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return minutes > 0 ? `${minutes}:${secs.padStart(5, '0')}` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !swimmer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error || 'Nadador no encontrado'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Perfil de {swimmer.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información básica */}
        <div className="lg:col-span-1 space-y-6">
          {/* Foto y datos básicos */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              {swimmer.photo ? (
                <img
                  src={swimmer.photo}
                  alt={swimmer.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
              )}
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{swimmer.name}</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{calculateAge(swimmer.birthDate)} años</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    swimmer.gender === 'MALE' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {swimmer.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                  </span>
                </div>

                {swimmer.club && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{swimmer.club.name}</span>
                  </div>
                )}

                {swimmer.coach && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Entrenador: {swimmer.coach}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del padre/tutor */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Padre/Tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{swimmer.user.name}</p>
              <p className="text-sm text-gray-600">{swimmer.user.email}</p>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Competencias</span>
                <span className="font-bold text-yellow-600">{swimmer.records.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Entrenamientos</span>
                <span className="font-bold text-blue-600">{swimmer.trainings.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Integración FDPN */}
          <FDPNIntegration 
            swimmerId={swimmer.id}
            swimmerName={swimmer.name}
            onDataUpdated={(data) => {
              toast.success('Datos de FDPN actualizados');
            }}
          />

          {/* Competencias */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Competencias ({swimmer.records.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {swimmer.records.length > 0 ? (
                <div className="space-y-3">
                  {swimmer.records.map((record) => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{record.style} - {record.distance}m</h4>
                          <p className="text-sm text-gray-600">{record.competition}</p>
                          <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{formatTime(record.time)}</p>
                          {record.medal && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {record.medal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay competencias registradas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Entrenamientos */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Entrenamientos Recientes ({swimmer.trainings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {swimmer.trainings.length > 0 ? (
                <div className="space-y-3">
                  {swimmer.trainings.slice(-5).map((training) => (
                    <div key={training.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{training.style}</h4>
                          <p className="text-sm text-gray-600">{formatDate(training.date)}</p>
                          {training.notes && (
                            <p className="text-xs text-gray-500 mt-1">{training.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{training.distance}m</p>
                          <p className="text-gray-600">{training.duration}min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay entrenamientos registrados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Análisis de Progreso */}
          <SwimmerProgress 
            swimmerId={swimmer.id}
            swimmerName={swimmer.firstName ? `${swimmer.firstName} ${swimmer.lastName}` : swimmer.name}
            fdpnTimes={swimmer.fdpnData ? JSON.parse(swimmer.fdpnData).times || [] : []}
          />
        </div>
      </div>
    </div>
  );
}