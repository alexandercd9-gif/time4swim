"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Medal, BarChart, User, Power, School, 
  Calendar, CreditCard, FileText, Settings, Timer, Menu, X 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  ],
  parents: [
    { href: "/parents/dashboard", label: "Mis Hijos", icon: Users, description: "Nadadores registrados" },
    { href: "/parents/entrenamientos", label: "Entrenamientos", icon: Timer, description: "Sesiones de práctica" },
    { href: "/parents/competencias", label: "Competencias", icon: Medal, description: "Participaciones" },
    { href: "/parents/records", label: "Records", icon: BarChart, description: "Mejores marcas" },
  ],
  club: [
    { href: "/club/dashboard", label: "Dashboard", icon: Home, description: "Vista general" },
    { href: "/club/nadadores", label: "Nadadores", icon: Users, description: "Del club" },
    { href: "/club/entrenadores", label: "Entrenadores", icon: User, description: "Profesores" },
    { href: "/club/grupos", label: "Grupos", icon: School, description: "Categorías" },
    { href: "/club/competencias", label: "Competiciones", icon: Medal, description: "Eventos" },
    { href: "/club/calendario", label: "Calendario", icon: Calendar, description: "Programación" },
    { href: "/club/pagos", label: "Pagos", icon: CreditCard, description: "Mensualidades" },
    { href: "/club/reportes", label: "Reportes", icon: FileText, description: "Informes" },
  ],
  // Profesor (TEACHER)
  profesor: [
    { href: "/profesor/dashboard", label: "Mis Nadadores", icon: Users, description: "Alumnos asignados" },
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .then(() => {
        setUser({ id: "", name: "", email: "", role: "parents" });
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
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
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Time4Swim</h1>
                  <p className="text-xs text-gray-500">Sistema de Natación</p>
                </div>
              </div>
            )}
            {collapsed && (
              <Link
                href={userRoleKey === 'admin' ? '/admin/dashboard' : userRoleKey === 'club' ? '/club/dashboard' : userRoleKey === 'profesor' ? '/profesor/dashboard' : userRoleKey === 'swimmer' ? '/swimmer/dashboard' : '/parents/dashboard'}
                aria-label="Ir al dashboard"
                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl"
              >
                <Timer className="h-6 w-6 text-white" />
              </Link>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* MENÚ */}
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className={`text-xs truncate ${isActive ? "text-cyan-100" : "text-gray-500"}`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* PERFIL + ACCIONES */}
          <div className="p-4 border-t border-gray-100">
            {user && user.name && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                {!collapsed ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 truncate">{user.name}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-red-600 hover:bg-red-50"
                        title="Cerrar sesión"
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="ml-auto text-red-600 hover:bg-red-50"
                    title="Cerrar sesión"
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Timer className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Time4Swim</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="text-red-600 hover:bg-red-50"
            >
              <Power className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 mt-16"
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
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className={`text-xs ${isActive ? "text-cyan-100" : "text-gray-500"}`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {user && user.name && (
              <div className="mt-4 border-t pt-4">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:bg-red-50"
              >
                <Power className="h-4 w-4 mr-2" />Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
