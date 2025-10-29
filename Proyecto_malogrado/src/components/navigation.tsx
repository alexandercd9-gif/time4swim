"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogoDisplay } from "@/components/logo-display";
import { useSidebar } from "@/hooks/use-sidebar";
import { Home, Users, ExternalLink, Timer, UserPlus, Star, Settings, LogOut, Menu, X } from "lucide-react";

type MenuItem = { href: string; label: string; icon: any; description?: string };

const adminMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/admin/users", label: "Gestión de Usuarios", icon: UserPlus },
  { href: "/dashboard/parents", label: "Gestión de Padres", icon: Users },
  { href: "/dashboard/fdpn", label: "Consulta FDPN", icon: ExternalLink },
];

const parentMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/swimmers", label: "Mis Hijos", icon: Users },
  { href: "/dashboard/affiliate-codes", label: "Códigos FDPN", icon: Star },
  { href: "/dashboard/fdpn", label: "Consulta FDPN", icon: ExternalLink },
  { href: "/dashboard/timer", label: "Cronómetro", icon: Timer },
];

const clubMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/club/swimmers", label: "Nadadores del Club", icon: Users },
  { href: "/dashboard/fdpn", label: "Consulta FDPN", icon: ExternalLink },
];

interface NavigationProps {
  user?: { name: string; email: string; role?: string } | null;
}

export function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const pathname = usePathname();

  // --- Seleccionar menú según el rol ---
  const getMenuItems = () => {
    switch (user?.role) {
      case "ADMIN":
        return adminMenuItems;
      case "CLUB":
        return clubMenuItems;
      case "PARENT":
      default:
        return parentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  // --- Cerrar sesión ---
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* SIDEBAR (Desktop) */}
      <nav
        className={`hidden lg:block fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-md z-40 transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-80"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* LOGO */}
          <div className="p-4 flex justify-center">
            <Link href="/dashboard">
              <LogoDisplay variant="sidebar" />
            </Link>
          </div>

          {/* MENÚ */}
          <div className="flex-1 px-3 space-y-1">
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
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  {!isSidebarCollapsed && (
                    <div>
                      <div className="font-medium">
                        {item.label}
                        {item.href === "/dashboard/fdpn" && (
                          <span className="text-red-600 ml-2 text-xs font-semibold">(PRONTO)</span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* PERFIL + BOTONES */}
          <div className="p-4 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                {!isSidebarCollapsed && "Configuración"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {!isSidebarCollapsed && "Cerrar Sesión"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center justify-between px-4">
          <Link href="/dashboard">
            <LogoDisplay variant="sidebar" />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          className={`fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <div>
                    <div className="font-medium">
                      {item.label}
                      {item.href === "/dashboard/fdpn" && (
                        <span className="text-red-600 ml-2 text-xs font-semibold">(PRONTO)</span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              );
            })}

            {user && (
              <div className="mt-4 border-t pt-4">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600">
                <Settings className="h-4 w-4 mr-2" />Configuración
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
