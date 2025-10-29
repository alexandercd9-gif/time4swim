"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Users, Trophy, BarChart3, Plus, Clock, TrendingUp, UserPlus, Building, GraduationCap, CreditCard, FileText, Activity, PieChart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TrialBanner from "@/components/TrialBanner";
import ParentAlerts from "@/components/ParentAlerts";
import ParentCoach from "@/components/ParentCoach";

type UserRole = 'ADMIN' | 'PARENT' | 'CLUB' | 'TEACHER';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus?: string;
  isTrialAccount?: boolean;
  trialExpiresAt?: string | null;
}

interface AdminStats {
  users: { total: number; newThisMonth: number };
  clubs: { total: number; active: number };
  swimmers: { total: number; newThisMonth: number };
  activity: { newUsersThisMonth: number; newSwimmersThisMonth: number };
  payments: { pending: number; overdue: number };
  monthlyRegistrations: Array<{ month: string; parents: number }>;
}

interface ParentStats {
  children: { total: number };
  trainings: { total: number; thisMonth: number };
  competitions: { total: number };
  records: { total: number; personalBests: number };
}

interface ClubStats {
  club: { name: string };
  swimmers: { total: number };
  trainings: { total: number; thisMonth: number };
  competitions: { total: number };
  records: { total: number; personalBests: number };
  medals: { gold: number; silver: number; bronze: number; total: number };
}

interface TeacherStats {
  club: { name: string };
  swimmers: { total: number };
  trainings: { total: number; thisMonth: number };
  records: { total: number; personalBests: number };
  competitions: { total: number };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener información del usuario
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) return;
        
        const userData = await userResponse.json();
        setUser(userData.user);

        // Obtener estadísticas según el rol
        let statsEndpoint = '/api/admin/stats';
        if (userData.user.role === 'PARENT') statsEndpoint = '/api/parent/stats';
        else if (userData.user.role === 'CLUB') statsEndpoint = '/api/club/stats';
        else if (userData.user.role === 'TEACHER') statsEndpoint = '/api/teacher/stats';

        const statsResponse = await fetch(statsEndpoint);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStats = () => {
    if (!stats || !user) return null;

    switch (user.role) {
      case 'ADMIN':
        return renderAdminStats(stats as AdminStats);
      case 'PARENT':
        return renderParentStats(stats as ParentStats);
      case 'CLUB':
        return renderClubStats(stats as ClubStats);
      case 'TEACHER':
        return renderTeacherStats(stats as TeacherStats);
      default:
        return null;
    }
  };

  const renderAdminStats = (adminStats: AdminStats) => (
    <div className="space-y-6">
      {/* Métricas principales en fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Padres Totales</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.users.total}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{adminStats.users.newThisMonth} este mes
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
                <p className="text-sm font-medium text-gray-600">Clubes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.clubs.active}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Building className="h-3 w-3" />
                  de {adminStats.clubs.total} registrados
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
                <p className="text-sm font-medium text-gray-600">Actividad Mensual</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.activity.newUsersThisMonth + adminStats.activity.newSwimmersThisMonth}</p>
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
                <p className="text-sm font-medium text-gray-600">Pendientes de Pago</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats.payments?.pending || 0}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <CreditCard className="h-3 w-3" />
                  {adminStats.payments?.overdue || 0} vencidos
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - División 50/50 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Registros de padres por mes */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Registros de Padres por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {adminStats.monthlyRegistrations && adminStats.monthlyRegistrations.some(item => item.parents > 0) ? (
                <div className="h-full flex flex-col">
                  {/* Área del gráfico */}
                  <div className="flex-1 flex items-end justify-between gap-2 pb-4">
                    {adminStats.monthlyRegistrations
                      .filter(item => item.parents > 0) // Solo mostrar meses con registros
                      .map((item, index) => {
                        const maxValue = Math.max(...(adminStats.monthlyRegistrations?.map(m => m.parents) || [1]));
                        const height = (item.parents / maxValue) * 100;
                        return (
                          <div key={index} className="flex flex-col items-center flex-1">
                            {/* Barra */}
                            <div className="w-full max-w-16 flex flex-col items-center">
                              <div className="relative w-full bg-gray-200 rounded-t-lg overflow-hidden" style={{ height: `${Math.max(height, 10)}%` }}>
                                <div className="w-full h-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg flex items-start justify-center pt-1">
                                  <span className="text-white text-xs font-medium">{item.parents}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Eje X - Meses */}
                  <div className="flex justify-between gap-2 pt-2 border-t border-gray-200">
                    {adminStats.monthlyRegistrations
                      .filter(item => item.parents > 0)
                      .map((item, index) => (
                        <div key={index} className="flex-1 text-center">
                          <span className="text-sm font-medium text-gray-600">{item.month}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay registros de padres este período</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de pie - Clubes con/sin usuarios */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              Distribución de Clubes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Visualización del pie chart simplificado */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* Círculo base */}
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Fondo */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="20"
                    />
                    {/* Segmento de clubes con usuarios */}
                    {adminStats.clubs.active > 0 && (
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="20"
                        strokeDasharray={`${(adminStats.clubs.active / adminStats.clubs.total) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  {/* Porcentaje central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {adminStats.clubs.total > 0 ? Math.round((adminStats.clubs.active / adminStats.clubs.total) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Activos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Clubes con usuarios</span>
                  </div>
                  <span className="text-sm font-medium">{adminStats.clubs.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Clubes sin usuarios</span>
                  </div>
                  <span className="text-sm font-medium">{adminStats.clubs.total - adminStats.clubs.active}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderParentStats = (parentStats: ParentStats) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mis Hijos</p>
              <p className="text-2xl font-bold text-gray-900">{parentStats.children.total}</p>
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                Nadadores registrados
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{parentStats.trainings.total}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Timer className="h-3 w-3" />
                {parentStats.trainings.thisMonth} este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Timer className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Competencias</p>
              <p className="text-2xl font-bold text-gray-900">{parentStats.competitions.total}</p>
              <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                <Trophy className="h-3 w-3" />
                Participaciones
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Records Personales</p>
              <p className="text-2xl font-bold text-gray-900">{parentStats.records.personalBests}</p>
              <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                <BarChart3 className="h-3 w-3" />
                de {parentStats.records.total} records
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClubStats = (clubStats: ClubStats) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nadadores del Club</p>
              <p className="text-2xl font-bold text-gray-900">{clubStats.swimmers.total}</p>
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                {clubStats.club.name}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{clubStats.trainings.total}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Timer className="h-3 w-3" />
                {clubStats.trainings.thisMonth} este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Timer className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Competencias</p>
              <p className="text-2xl font-bold text-gray-900">{clubStats.competitions.total}</p>
              <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                <Trophy className="h-3 w-3" />
                Participaciones
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medallas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{clubStats.medals.total}</p>
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <Trophy className="h-3 w-3" />
                🥇{clubStats.medals.gold} 🥈{clubStats.medals.silver} 🥉{clubStats.medals.bronze}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeacherStats = (teacherStats: TeacherStats) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mi Club</p>
              <p className="text-2xl font-bold text-gray-900">{teacherStats.swimmers.total}</p>
              <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                <Building className="h-3 w-3" />
                {teacherStats.club.name}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nadadores</p>
              <p className="text-2xl font-bold text-gray-900">{teacherStats.swimmers.total}</p>
              <p className="text-xs text-cyan-600 flex items-center gap-1 mt-1">
                <Users className="h-3 w-3" />
                Bajo mi supervisión
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{teacherStats.trainings.total}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Timer className="h-3 w-3" />
                {teacherStats.trainings.thisMonth} este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Timer className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Records del Club</p>
              <p className="text-2xl font-bold text-gray-900">{teacherStats.records.personalBests}</p>
              <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                <BarChart3 className="h-3 w-3" />
                Marcas personales
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActions = () => {
    if (!user) return null;

    switch (user.role) {
      case 'ADMIN':
        return (
          <>
            <Link href="/dashboard/parents">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Gestionar Usuarios</div>
                  <div className="text-xs text-gray-500">Administrar sistema</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/clubs">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Gestionar Clubes</div>
                  <div className="text-xs text-gray-500">Administrar clubes</div>
                </div>
              </Button>
            </Link>
          </>
        );
      case 'PARENT':
        return (
          <>
            <Link href="/dashboard/swimmers">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Agregar Nadador</div>
                  <div className="text-xs text-gray-500">Registrar hijo</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/timer">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Cronómetro</div>
                  <div className="text-xs text-gray-500">Nuevo entrenamiento</div>
                </div>
              </Button>
            </Link>
          </>
        );
      case 'CLUB':
        return (
          <>
            <Link href="/dashboard/swimmers">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Nadadores del Club</div>
                  <div className="text-xs text-gray-500">Gestionar nadadores</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/teachers">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Agregar Profesor</div>
                  <div className="text-xs text-gray-500">Gestionar entrenadores</div>
                </div>
              </Button>
            </Link>
          </>
        );
      case 'TEACHER':
        return (
          <>
            <Link href="/dashboard/swimmers">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Mis Nadadores</div>
                  <div className="text-xs text-gray-500">Nadadores del club</div>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/timer">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Cronómetro</div>
                  <div className="text-xs text-gray-500">Entrenamientos</div>
                </div>
              </Button>
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {user?.role === 'ADMIN' && 'Panel de administración del sistema'}
            {user?.role === 'PARENT' && 'Panel familiar de natación'}
            {user?.role === 'CLUB' && `Panel del club${stats?.club?.name ? ` - ${stats.club.name}` : ''}`}
            {user?.role === 'TEACHER' && `Panel del profesor${stats?.club?.name ? ` - ${stats.club.name}` : ''}`}
          </p>
        </div>
      </div>

      {/* Banner de Trial para usuarios no permanentes */}
      {user && user.isTrialAccount && (
        <TrialBanner user={user} />
      )}

      {/* Notificaciones y Asistente para Padres */}
      {user?.role === 'PARENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ParentAlerts showCompact={true} />
          <ParentCoach showFullInterface={false} />
        </div>
      )}

      {/* Estadísticas */}
      {renderStats()}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-cyan-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderActions()}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-sm font-medium text-gray-700">
                {user?.role === 'ADMIN' && 'Sistema de gestión centralizado'}
                {user?.role === 'PARENT' && 'Datos controlados por la familia'}
                {user?.role === 'CLUB' && 'Nadadores asignados por padres'}
                {user?.role === 'TEACHER' && 'Vista del entrenador'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {user?.role === 'ADMIN' && 'Gestiona usuarios, clubes y sistema completo'}
                {user?.role === 'PARENT' && 'Los datos viajan contigo al cambiar de club'}
                {user?.role === 'CLUB' && 'Los padres eligen y asignan nadadores a tu club'}
                {user?.role === 'TEACHER' && 'Supervisa nadadores del club asignado'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}