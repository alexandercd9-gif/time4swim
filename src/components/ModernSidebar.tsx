"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Medal, BarChart, User, Power, School, 
  Calendar, CreditCard, FileText, Settings, Timer, Menu, X, TrendingUp, Camera 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

type MenuItem = { 
  href: string; 
  label: string; 
  icon: any;
  description?: string;
};

const navByRole = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home, description: "Vista general" },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users, description: "Gestionar usuarios" },
    { href: "/admin/clubes", label: "Clubes", icon: School, description: "Gestionar clubes" },
    { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart, description: "Reportes y análisis" },
    { href: "/admin/configuracion", label: "Configuración", icon: Settings, description: "Credenciales Culqi" },
  ],
  parents: [
    { href: "/parents/dashboard", label: "Dashboard", icon: Home, description: "Vista general" },
    { href: "/parents/children", label: "Mis Hijos", icon: Users, description: "Nadadores registrados" },
    { href: "/parents/cronometro", label: "Cronómetro", icon: Timer, description: "Registrar tiempos" },
    { href: "/parents/tiempos", label: "Análisis de Tiempos", icon: TrendingUp, description: "Análisis avanzado" },
    { href: "/parents/galeria", label: "Galería", icon: Camera, description: "Fotos y videos" },
    { href: "/parents/competencias", label: "Competencias", icon: Medal, description: "Participaciones" },
    { href: "/parents/events", label: "Eventos", icon: Calendar, description: "Próximas competencias" },
    { href: "/parents/records", label: "Records", icon: BarChart, description: "Mejores marcas" },
  ],
    club: [
    { href: "/club/dashboard", label: "Dashboard", icon: Home, description: "Vista general" },
    { href: "/club/nadadores", label: "Nadadores", icon: Users, description: "Del club" },
    { href: "/club/entrenadores", label: "Entrenadores", icon: User, description: "Profesores" },
    { href: "/club/competencias", label: "Competiciones", icon: Medal, description: "Eventos" },
    { href: "/club/events", label: "Eventos (Agenda)", icon: Calendar, description: "Próximos eventos" },
    { href: "/club/pagos", label: "Pagos", icon: CreditCard, description: "Mensualidades" },
    { href: "/club/reportes", label: "Reportes", icon: FileText, description: "Informes" },
  ],
  // Profesor (TEACHER)
  profesor: [
    { href: "/profesor/dashboard", label: "Mis Nadadores", icon: Users, description: "Alumnos asignados" },
    { href: "/profesor/competencias", label: "Competiciones", icon: Medal, description: "Competencias internas" },
    { href: "/profesor/eventos", label: "Eventos", icon: Calendar, description: "Eventos externos" },
    { href: "/profesor/planes", label: "Planes", icon: BarChart, description: "Entrenamientos" },
    { href: "/profesor/progreso", label: "Progreso", icon: Medal, description: "Evolución" },
  ],
  swimmer: [
    { href: "/swimmer/dashboard", label: "Mi Progreso", icon: BarChart, description: "Estadísticas" },
    { href: "/swimmer/tiempos", label: "Mis Tiempos", icon: Timer, description: "Marcas personales" },
    { href: "/swimmer/logros", label: "Logros", icon: Medal, description: "Premios y medallas" },
  ],
};

export default function ModernSidebar() {
  const { user, setUser, loading } = useUser();
  const { isSidebarCollapsed: collapsed, setIsSidebarCollapsed: setCollapsed } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Nota: el contador de eventos y su insignia visual se gestionan en TopBar (campana).
  // Aquí retiramos la insignia en el menú lateral para evitar duplicidad.

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        localStorage.removeItem('lastEventCheck'); // Limpiar también el check de eventos
        
        // Forzar redirección inmediata sin resetear el estado
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error('Error en logout:', err);
        // Aún así redirigir al login
        localStorage.clear();
        window.location.href = "/login";
      });
  };

  // Detectar el rol desde la URL actual como fallback
  const getRoleFromPath = (): keyof typeof navByRole => {
    if (pathname?.startsWith('/admin')) return 'admin';
    if (pathname?.startsWith('/parents')) return 'parents';
    if (pathname?.startsWith('/club')) return 'club';
    if (pathname?.startsWith('/profesor')) return 'profesor';
    if (pathname?.startsWith('/swimmer')) return 'swimmer';
    return 'parents';
  };

  // Obtener los items del menú según el rol del usuario
  // Convertir el rol a minúsculas para que coincida con las claves del objeto navByRole
  // Si el usuario está cargado, usar su rol; si no, usar el rol detectado de la URL
  const userRoleKey = !loading && user.id 
    ? (() => {
        const raw = String(user.role || '').toLowerCase();
        // Normalizar TEACHER/coach/profesor → 'profesor'
        if (["teacher", "coach", "entrenador", "profesor"].includes(raw)) return 'profesor' as keyof typeof navByRole;
        // parent/parents/family → 'parents'
        if (["parent", "parents", "family", "familia"].includes(raw)) return 'parents' as keyof typeof navByRole;
        // admin / club / swimmer quedan igual si existen
        return (raw as keyof typeof navByRole) in navByRole ? (raw as keyof typeof navByRole) : 'parents';
      })()
    : getRoleFromPath();
  
  const menuItems = navByRole[userRoleKey] || navByRole.parents;

  // Mostrar loading mientras se carga el usuario
  if (loading) {
    return (
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-md z-40">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* SIDEBAR (Desktop) */}
      <nav
        className={`hidden lg:block fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-md z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-80"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* LOGO */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-center">
            {!collapsed && (
              <Link
                href={userRoleKey === 'admin' ? '/admin/dashboard' : userRoleKey === 'club' ? '/club/dashboard' : userRoleKey === 'profesor' ? '/profesor/dashboard' : userRoleKey === 'swimmer' ? '/swimmer/dashboard' : '/parents/dashboard'}
                aria-label="Ir al dashboard"
              >
                <img src="/logo.png" alt="Logo" className="h-16 w-auto max-w-[200px] object-contain transition-all duration-300" />
              </Link>
            )}
            {collapsed && (
              <Link
                href={userRoleKey === 'admin' ? '/admin/dashboard' : userRoleKey === 'club' ? '/club/dashboard' : userRoleKey === 'profesor' ? '/profesor/dashboard' : userRoleKey === 'swimmer' ? '/swimmer/dashboard' : '/parents/dashboard'}
                aria-label="Ir al dashboard"
                className="inline-flex items-center justify-center"
              >
                <img src="/logito.png" alt="Logo pequeño" className="h-10 w-10 object-contain" />
              </Link>
            )}
          </div>

          {/* MENÚ */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'} px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                  </div>
                  {!collapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.description && (
                          <div className={`text-xs truncate ${isActive ? "text-cyan-100" : "text-gray-500"}`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* PERFIL + ACCIONES (moved to TopBar) */}
          <div className="p-4 border-t border-gray-100" />
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-center px-4">
          <Link
            href={userRoleKey === 'admin' ? '/admin/dashboard' : userRoleKey === 'club' ? '/club/dashboard' : userRoleKey === 'profesor' ? '/profesor/dashboard' : userRoleKey === 'swimmer' ? '/swimmer/dashboard' : '/parents/dashboard'}
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <img src="/logo_horizontal.png" alt="Time4Swim" className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-40 mt-16"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Separador */}
              <div className="my-3 border-t border-gray-200"></div>

              {/* Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Power className="h-5 w-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
