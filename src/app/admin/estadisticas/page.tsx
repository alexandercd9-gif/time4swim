"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Activity, Award, Calendar, BarChart3 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalClubs: number;
  totalSwimmers: number;
  totalCoaches: number;
  totalParents: number;
  activeTrials: number;
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalClubs: 0,
    totalSwimmers: 0,
    totalCoaches: 0,
    totalParents: 0,
    activeTrials: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      description: "Usuarios registrados"
    },
    {
      title: "Clubes",
      value: stats.totalClubs,
      icon: Building2,
      gradient: "from-purple-500 to-purple-600",
      description: "Clubes activos"
    },
    {
      title: "Nadadores",
      value: stats.totalSwimmers,
      icon: Activity,
      gradient: "from-cyan-500 to-cyan-600",
      description: "Nadadores registrados"
    },
    {
      title: "Entrenadores",
      value: stats.totalCoaches,
      icon: Award,
      gradient: "from-green-500 to-green-600",
      description: "Entrenadores activos"
    },
    {
      title: "Padres",
      value: stats.totalParents,
      icon: Users,
      gradient: "from-orange-500 to-orange-600",
      description: "Padres/tutores"
    },
    {
      title: "Trials Activos",
      value: stats.activeTrials,
      icon: TrendingUp,
      gradient: "from-yellow-500 to-yellow-600",
      description: "Cuentas en período de prueba"
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-gray-600 mt-1">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Estadísticas del Sistema
        </h1>
        <p className="text-gray-600 mt-1">Vista general del sistema Time4Swim</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Próximamente: Gráficos de actividad y tendencias del sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Próximamente: Métricas de crecimiento y conversión de trials
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
