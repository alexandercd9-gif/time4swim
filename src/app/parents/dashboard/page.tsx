"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Clock, 
  Trophy, 
  Activity, 
  Timer,
  BarChart3,
  Award
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TrainingChart from "@/components/TrainingChart";
import BestTimesByStyle from "@/components/BestTimesByStyle";
import UpcomingEvents from "@/components/UpcomingEvents";

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
  const [openChart, setOpenChart] = useState(false);
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/parent/stats', { credentials: 'include' });
        if (!res.ok) throw new Error('No se pudieron cargar las estadísticas');
        const data = await res.json();
        const mapped: ParentStats = {
          children: { total: data.children?.total || 0, active: data.children?.total || 0 },
          trainings: { total: data.trainings?.total || 0, thisMonth: data.trainings?.thisMonth || 0 },
          competitions: { total: data.competitions?.total || 0, thisYear: data.competitions?.total || 0 },
          records: { total: data.records?.total || 0, personalBests: data.records?.personalBests || 0 },
        };
        setStats(mapped);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('No se pudieron cargar tus estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Cargar hijos para el modal de gráfico
    fetch('/api/swimmers', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setChildren((data || []).map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, []);

  const quickActions: QuickAction[] = [
    {
      icon: <Timer className="h-6 w-6 text-white" />,
      title: "Iniciar Cronómetro",
      description: "Nuevo entrenamiento",
      href: "/parents/cronometro",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Gestionar Nadadores",
      description: "Ver mis nadadores",
      href: "/parents/children",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Trophy className="h-6 w-6 text-white" />,
      title: "Nueva Competencia",
      description: "Registrar competencia",
      href: "/parents/competencias",
      color: "from-orange-500 to-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header consistente */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión de natación</p>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((a) => (
            <button
              key={a.title}
              onClick={() => router.push(a.href)}
              className={`relative overflow-hidden rounded-xl border bg-white text-left shadow hover:shadow-md transition-all`}
            >
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${a.color}`} />
              <div className="relative flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow`}>{a.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Layout según imagen: izquierda = Mejores tiempos, derecha = KPIs apilados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Columna izquierda: Mejores tiempos por estilo */}
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Mejores tiempos por estilo
            </h2>
            <div className="space-y-4">
              <BestTimesByStyle />
            </div>
          </div>

          {/* Columna derecha: Entrenamientos y Competencias apilados */}
          <div className="space-y-6">
            {/* Entrenamientos KPI */}
            <div className="bg-white rounded-xl shadow p-6 border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Entrenamientos</p>
                  <p className="text-5xl font-bold text-gray-900">
                    {stats?.trainings.total || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <span>➤</span> Total registrados
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            {/* Competencias KPI */}
            <div className="bg-white rounded-xl shadow p-6 border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Competencias</p>
                  <p className="text-5xl font-bold text-gray-900">
                    {stats?.competitions.total || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <span>➤</span> Participaciones registradas
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Resumen del Mes - full width */}
        <div className="bg-white rounded-xl shadow p-6 border mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Resumen del Mes
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-blue-700">Entrenamientos este mes</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.trainings.thisMonth || 0}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm font-medium text-green-700">Competencias este año</span>
              <span className="text-2xl font-bold text-green-600">{stats?.competitions.thisYear || 0}</span>
            </div>

            {/* Espacio para gráfico */}
            <div className="mt-6 p-8 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="text-gray-600 text-sm">
                  Visualiza la evolución de tiempos por mes
                </div>
                <button onClick={() => setOpenChart(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Ver gráfico
                </button>
              </div>
            </div>
          </div>
        </div>        {/* Modal de gráfico en dashboard */}
        
        {/* Upcoming events / Agenda */}
        <div className="mb-8">
          <UpcomingEvents />
        </div>

        <Dialog open={openChart} onOpenChange={setOpenChart}>
          <DialogContent className="sm:max-w-[720px]">
            <DialogHeader>
              <DialogTitle>Tiempos de entrenamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Selecciona un nadador</p>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mis hijos" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.length === 0 ? (
                      <SelectItem value="none" disabled>No hay nadadores</SelectItem>
                    ) : (
                      children.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedChild ? (
                <TrainingChart childId={selectedChild} />
              ) : (
                <p className="text-sm text-gray-500">Elige un nadador para ver su evolución.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}