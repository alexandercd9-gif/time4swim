"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Clock, 
  Trophy, 
  Activity, 
  Plus, 
  Timer,
  BarChart3,
  UserPlus,
  Award
} from "lucide-react";

interface ParentStats {
  children: { total: number; active: number };
  trainings: { total: number; thisMonth: number };
  competitions: { total: number; thisYear: number };
  records: { total: number; personalBests: number };
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

export default function ParentsDashboard() {
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular datos - reemplazar con tu API real
        const mockStats: ParentStats = {
          children: { total: 2, active: 2 },
          trainings: { total: 45, thisMonth: 8 },
          competitions: { total: 12, thisYear: 3 },
          records: { total: 28, personalBests: 5 }
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions: QuickAction[] = [
    {
      icon: <Timer className="h-6 w-6" />,
      title: "Iniciar Cronómetro",
      description: "Nuevo entrenamiento",
      href: "/timer",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestionar Nadadores",
      description: "Ver mis nadadores",
      href: "/swimmers",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Nueva Competencia",
      description: "Registrar competencia",
      href: "/competitions/new",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <Plus className="h-6 w-6" />,
      title: "Agregar Nadador",
      description: "Registrar nuevo nadador",
      href: "/swimmers/new",
      color: "from-purple-500 to-pink-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Bienvenido al sistema de gestión de natación
          </p>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Nadadores */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nadadores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.children.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              ➤ Registrados en el sistema
            </p>
          </div>

          {/* Entrenamientos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.trainings.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              ➤ Total registrados
            </p>
          </div>

          {/* Competencias */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Competencias</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.competitions.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              ➤ Participaciones registradas
            </p>
          </div>

          {/* Records */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.records.personalBests || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              ➤ Marcas personales
            </p>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Acciones Rápidas
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Resumen del Mes
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Entrenamientos este mes</span>
                <span className="text-lg font-bold text-blue-600">{stats?.trainings.thisMonth || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Competencias este año</span>
                <span className="text-lg font-bold text-green-600">{stats?.competitions.thisYear || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Nadadores activos</span>
                <span className="text-lg font-bold text-purple-600">{stats?.children.active || 0}</span>
              </div>

              {/* Espacio para gráfico simple */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Gráfico de progreso disponible próximamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}