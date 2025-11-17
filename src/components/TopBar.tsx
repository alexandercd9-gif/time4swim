"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/hooks/use-sidebar";
import { LogOut, Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar() {
  const { user } = useUser();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [eventsCount, setEventsCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Cargar el contador de eventos para padres
  useEffect(() => {
    if (user.role === 'PARENT' || user.role === 'parents') {
      const fetchEventsCount = async () => {
        try {
          const res = await fetch('/api/parent/events', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            
            // Obtener la última vez que se revisaron los eventos
            const lastCheck = localStorage.getItem('lastEventCheck');
            
            if (!lastCheck) {
              // Si nunca ha visto los eventos, contar todos
              setEventsCount(data.length);
            } else {
              // Contar solo eventos nuevos (creados después de la última revisión)
              const lastCheckDate = new Date(lastCheck);
              const newEvents = data.filter((event: any) => {
                if (!event.createdAt) return false;
                const eventCreatedDate = new Date(event.createdAt);
                return eventCreatedDate > lastCheckDate;
              });
              setEventsCount(newEvents.length);
            }
          }
        } catch (error) {
          console.error('Error fetching events count:', error);
        }
      };
      fetchEventsCount();
      
      // Actualizar cada 5 minutos
      const interval = setInterval(fetchEventsCount, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user.role, pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      // clean local data and redirect
      try { 
        localStorage.removeItem('token'); 
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('userData'); 
        localStorage.removeItem('lastEventCheck');
      } catch(e){}
      window.location.href = '/login';
    }
  };

  const handleNotificationClick = () => {
    // Marcar como revisados al hacer clic
    localStorage.setItem('lastEventCheck', new Date().toISOString());
    setEventsCount(0);
    router.push('/parents/events');
  };

  return (
    <div className="bg-white border-b border-gray-200 -mx-6 lg:-mx-8 px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Left side: Toggle sidebar button (desktop only) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors ml-8"
          title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect y="4" width="20" height="2" rx="1" fill="#4B5563" />
            <rect y="9" width="20" height="2" rx="1" fill="#4B5563" />
            <rect y="14" width="20" height="2" rx="1" fill="#4B5563" />
          </svg>
        </button>

        {/* Mobile: Logo */}
        <div className="lg:hidden flex-1 flex justify-center">
          <img src="/logito.png" alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
        </div>
      </div>

      {/* Right side: Notifications + User info + Logout */}
      <div className="flex items-center gap-3">
        {/* Notification bell (only for parents with events) */}
        {(user.role === 'PARENT' || user.role === 'parents') && (
          <button
            onClick={handleNotificationClick}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            title="Eventos y notificaciones"
          >
            <Bell className="h-5 w-5" />
            {eventsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                {eventsCount > 9 ? '9+' : eventsCount}
              </span>
            )}
          </button>
        )}

        {/* User info */}
        <div className="hidden sm:flex items-center gap-3">
          {/* User details */}
          <div className="flex flex-col min-w-0">
            {user?.name && (
              <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px] md:max-w-xs">
                {user.name}
              </div>
            )}
            {user?.email && (
              <div className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-xs">
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Only show user name */}
        <div className="sm:hidden flex flex-col min-w-0">
          {user?.name && (
            <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
              {user.name}
            </div>
          )}
        </div>

        {/* Logout button - minimalist, no circle */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
