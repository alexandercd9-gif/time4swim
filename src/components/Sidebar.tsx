"use client";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Home, Users, Medal, BarChart, User, LogOut, School } from "lucide-react";
import { useState } from "react";

const navByRole = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { href: "/admin/usuarios", label: "Usuarios", icon: <Users size={20} /> },
    { href: "/admin/clubes", label: "Clubes", icon: <School size={20} /> },
    { href: "/admin/estadisticas", label: "Estadísticas", icon: <BarChart size={20} /> },
  ],
  parents: [
    { href: "/parents/dashboard", label: "Mis Hijos", icon: <Users size={20} /> },
    { href: "/parents/entrenamientos", label: "Entrenamientos", icon: <BarChart size={20} /> },
    { href: "/parents/competencias", label: "Competencias", icon: <Medal size={20} /> },
    { href: "/parents/records", label: "Records", icon: <Medal size={20} /> },
  ],
  club: [
    { href: "/club/dashboard", label: "Nadadores", icon: <Users size={20} /> },
    { href: "/club/entrenamientos", label: "Entrenamientos", icon: <BarChart size={20} /> },
    { href: "/club/medallas", label: "Medallas", icon: <Medal size={20} /> },
    { href: "/club/gestion", label: "Gestión", icon: <User size={20} /> },
  ],
  coach: [
    { href: "/coach/dashboard", label: "Mis Nadadores", icon: <Users size={20} /> },
    { href: "/coach/planes", label: "Planes", icon: <BarChart size={20} /> },
    { href: "/coach/progreso", label: "Progreso", icon: <Medal size={20} /> },
  ],
  swimmer: [
    { href: "/swimmer/dashboard", label: "Mi Progreso", icon: <BarChart size={20} /> },
    { href: "/swimmer/tiempos", label: "Mis Tiempos", icon: <Medal size={20} /> },
    { href: "/swimmer/logros", label: "Logros", icon: <Medal size={20} /> },
  ],
};

export default function Sidebar() {
  const { user } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-blue-900 text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"} min-h-screen shadow-lg glassmorphism`}>
      <div className="flex items-center justify-between px-4 py-5">
        <img src="/logo.png" alt="Time4Swim" className="h-8 w-auto" />
        <button className="md:hidden" onClick={() => setCollapsed(!collapsed)}>
          <span className="text-xl">{collapsed ? "»" : "«"}</span>
        </button>
      </div>
      <nav className="flex-1">
        <ul>
          {navByRole[user.role].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center gap-3 px-6 py-3 hover:bg-blue-800 transition rounded-lg">
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t border-blue-800">
        <button className="flex items-center gap-2 text-red-300 hover:text-red-500 transition">
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
