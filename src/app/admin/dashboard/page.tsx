"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, TrendingUp, Activity, CreditCard, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface AdminStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  clubs: {
    total: number;
    active: number;
  };
  swimmers: {
    total: number;
    newThisMonth: number;
  };
  activity: {
    newUsersThisMonth: number;
    newSwimmersThisMonth: number;
  };
  payments: {
    pending: number;
    overdue: number;
  };
  monthlyRegistrations: Array<{
    month: string;
    parents: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
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

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrador</h1>
        <p className="text-gray-600">Panel de administración del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-700">Padres Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats?.users.newThisMonth || 0} este mes
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-700">Clubes Registrados</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.clubs.total || 0}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Building className="h-3 w-3" />
                  Activos: {stats?.clubs.active || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-700">Actividad Mensual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.activity.newUsersThisMonth || 0) + (stats?.activity.newSwimmersThisMonth || 0)}
                </p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3" />
                  Nuevos registros
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-700">Pendientes de Pago</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.payments.pending || 0}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <CreditCard className="h-3 w-3" />
                  {stats?.payments.overdue || 0} vencidos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Registros de Padres por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {stats?.monthlyRegistrations && stats.monthlyRegistrations.some(item => item.parents > 0) ? (
                <div className="h-full flex flex-col">
                  <div className="relative flex-1 flex items-end justify-between gap-2 pb-2" style={{ height: 200 }}>
                    {(() => {
                      const data = stats.monthlyRegistrations.filter((m) => m.parents > 0);
                      const maxValue = Math.max(...(data.map((m) => m.parents)), 1);
                      return (
                        <>
                          {/* baseline guides */}
                          <div className="absolute left-0 right-0 top-0 h-px bg-gray-200/70 pointer-events-none" />
                          <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-100 pointer-events-none" />
                          <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-100 pointer-events-none" />
                          <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-100 pointer-events-none" />
                          {/* axis labels */}
                          <div className="absolute right-0 -translate-y-1/2 top-0 text-[10px] text-gray-400 bg-white/70 px-1 rounded pointer-events-none">{maxValue}</div>
                          <div className="absolute right-0 -translate-y-1/2 top-1/2 text-[10px] text-gray-400 bg-white/70 px-1 rounded pointer-events-none">{Math.ceil(maxValue/2)}</div>
                        </>
                      );
                    })()}
                    {(() => {
                      const data = stats.monthlyRegistrations.filter((m) => m.parents > 0);
                      const maxValue = Math.max(...(data.map((m) => m.parents)), 1);
                      return data.map((item, index) => {
                        const pct = Math.max(item.parents / maxValue, 0.08);
                        const barHeight = Math.round(pct * 200); // px
                        return (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="w-full max-w-12 flex flex-col items-center">
                              <div
                                className="relative w-full bg-gray-200 rounded-t-lg overflow-hidden"
                                style={{ height: barHeight }}
                                title={`${item.month}: ${item.parents}`}
                              >
                                <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg flex items-start justify-center pt-0.5 transition-all duration-500">
                                  <span className="text-white text-xs font-semibold drop-shadow-sm leading-none">{item.parents}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-between gap-2 pt-2 border-t border-gray-200">
                    {stats.monthlyRegistrations.filter(item => item.parents > 0).map((item, index) => (
                      <div key={index} className="flex-1 text-center">
                        <span className="text-sm font-medium text-gray-700">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-base">No hay registros de padres este período</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              Distribución de Clubes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                    {stats && stats.clubs.active > 0 && (
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="20" 
                        strokeDasharray={`${(stats.clubs.active / stats.clubs.total) * 251.2} 251.2`}
                        strokeLinecap="round" 
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {stats && stats.clubs.total > 0 ? Math.round((stats.clubs.active / stats.clubs.total) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Activos</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Con acceso</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.clubs.active || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Sin acceso</span>
                  </div>
                  <span className="text-sm font-medium">{stats ? stats.clubs.total - stats.clubs.active : 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
