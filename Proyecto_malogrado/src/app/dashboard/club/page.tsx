"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Trophy, 
  Medal,
  BarChart3,
  Building2,
  UserCheck,
  Activity
} from "lucide-react";

interface ClubStats {
  totalSwimmers: number;
  totalTeachers: number;
  totalCompetitions: number;
  totalMedals: number;
  activeSwimmers: number;
  monthlyRegistrations: number;
}

export default function ClubDashboard() {
  const [stats, setStats] = useState<ClubStats>({
    totalSwimmers: 0,
    totalTeachers: 0,
    totalCompetitions: 0,
    totalMedals: 0,
    activeSwimmers: 0,
    monthlyRegistrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubStats();
  }, []);

  const fetchClubStats = async () => {
    try {
      const response = await fetch('/api/club/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching club stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando dashboard del club...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard del Club</h1>
          <p className="text-gray-600">Gestión y estadísticas de tu club de natación</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Nadadores */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nadadores</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalSwimmers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeSwimmers} activos este mes
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Profesores */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profesores</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalTeachers}</p>
              <p className="text-xs text-gray-500 mt-1">
                Equipo de entrenadores
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Competencias */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Competencias</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalCompetitions}</p>
              <p className="text-xs text-gray-500 mt-1">
                Este año
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Medallas Obtenidas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medallas Obtenidas</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalMedals}</p>
              <p className="text-xs text-gray-500 mt-1">
                Por nadadores del club
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Medal className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Registros Mensuales */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nuevos este Mes</p>
              <p className="text-3xl font-bold text-purple-600">{stats.monthlyRegistrations}</p>
              <p className="text-xs text-gray-500 mt-1">
                Nadadores registrados
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Rendimiento General */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendimiento</p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.totalSwimmers > 0 ? Math.round((stats.totalMedals / stats.totalSwimmers) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tasa de medallas por nadador
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Gestión de Nadadores
          </h3>
          <p className="text-gray-600 mb-4">
            Administra los nadadores de tu club, revisa su progreso y estadísticas.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nadadores activos:</span>
              <span className="font-medium">{stats.activeSwimmers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total registrados:</span>
              <span className="font-medium">{stats.totalSwimmers}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Equipo de Profesores
          </h3>
          <p className="text-gray-600 mb-4">
            Gestiona tu equipo de entrenadores y asigna nadadores a cada profesor.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profesores activos:</span>
              <span className="font-medium">{stats.totalTeachers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Promedio nadadores/profesor:</span>
              <span className="font-medium">
                {stats.totalTeachers > 0 ? Math.round(stats.totalSwimmers / stats.totalTeachers) : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h4 className="font-medium">Competencias</h4>
            <p className="text-2xl font-bold text-orange-600">{stats.totalCompetitions}</p>
            <p className="text-sm text-gray-500">participaciones este año</p>
          </div>
          <div className="text-center">
            <Medal className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-medium">Medallas</h4>
            <p className="text-2xl font-bold text-yellow-600">{stats.totalMedals}</p>
            <p className="text-sm text-gray-500">obtenidas por el club</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <h4 className="font-medium">Efectividad</h4>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.totalSwimmers > 0 ? ((stats.totalMedals / stats.totalSwimmers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-500">de éxito en competencias</p>
          </div>
        </div>
      </Card>
    </div>
  );
}