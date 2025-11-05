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
  Award,
  Home
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TrainingChart from "@/components/TrainingChart";
import BestTimesByStyle from "@/components/BestTimesByStyle";
import NextEventCompact from "@/components/NextEventCompact";

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
    // Cargar hijos para el modal de gráfico y preseleccionar desde almacenamiento
    fetch('/api/swimmers', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const mapped: Array<{ id: string; name: string }> = (data || []).map((c: any) => ({ id: c.id, name: c.name }));
        setChildren(mapped);
        if (mapped.length > 0) {
          try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
            const exists = stored && mapped.some((m) => m.id === stored);
            setSelectedChild(exists ? (stored as string) : mapped[0].id);
          } catch {
            setSelectedChild(mapped[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Persistir cambios de selección para mantener consistencia con otros módulos
  useEffect(() => {
    if (selectedChild) {
      try { localStorage.setItem('selectedChildId', selectedChild); } catch {}
    }
  }, [selectedChild]);

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
        {/* Header (match Parents > Children spacing and structure) */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-600" />
              Dashboard
            </h1>
            <p className="text-gray-600">Bienvenido al sistema de gestión de natación</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {quickActions.map((a) => (
            <button
              key={a.title}
              onClick={() => router.push(a.href)}
              className={`relative overflow-hidden rounded-xl border bg-white text-left shadow hover:shadow-md transition-all`}
            >
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${a.color}`} />
              <div className="relative flex items-center gap-3 p-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow`}>{a.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Layout: izquierda = Mejores tiempos, derecha = Entrenamientos/Competencias + Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Columna izquierda: Mejores tiempos por estilo */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Mejores tiempos por estilo
            </h2>
            <div className="space-y-3">
              <BestTimesByStyle />
            </div>
          </div>

          {/* Columna derecha: Entrenamientos/Competencias arriba + Resumen del Mes abajo */}
          <div className="flex flex-col gap-3">
            {/* Fila de 2 tarjetas: Entrenamientos y Competencias */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gráficos acceso rápido */}
              <button
                type="button"
                onClick={() => {
                  if (!selectedChild && children.length > 0) {
                    try {
                      const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedChildId') : null;
                      const exists = stored && children.some((m) => m.id === stored);
                      setSelectedChild(exists ? (stored as string) : children[0].id);
                    } catch {
                      setSelectedChild(children[0].id);
                    }
                  }
                  setOpenChart(true);
                }}
                className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200 text-left hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">Gráficos</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                      Evolución
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">Ver gráfico</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </button>

              {/* Competencias KPI */}
              <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">Competencias</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                      {stats?.competitions.total || 0}
                    </p>
                    <p className="text-xs text-gray-500 truncate">➤ Participaciones</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen del Mes */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex-1 flex flex-col gap-3 min-h-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 shrink-0">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Resumen del Mes
              </h2>
          
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                <div className="flex flex-col justify-center items-center p-3 bg-blue-50 rounded-lg border border-blue-100 h-full">
                  <span className="text-xs font-semibold text-blue-700 mb-1 text-center">Entrenamientos este mes</span>
                  <span className="text-2xl font-bold text-blue-600">{stats?.trainings.thisMonth || 0}</span>
                </div>
                
                <div className="flex flex-col justify-center items-center p-3 bg-green-50 rounded-lg border border-green-100 h-full">
                  <span className="text-xs font-semibold text-green-700 mb-1 text-center">Competencias este año</span>
                  <span className="text-2xl font-bold text-green-600">{stats?.competitions.thisYear || 0}</span>
                </div>
              </div>

              {/* Próximo evento (en lugar del banner del gráfico) */}
              <NextEventCompact />
            </div>
          </div>
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