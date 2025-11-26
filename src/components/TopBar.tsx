"use client";

import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/hooks/use-sidebar";
import { LogOut, Bell, Settings, ChevronDown, User as UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import NovedadesButton from "@/components/club/NovedadesButton";
import NovedadesPanel from "@/components/club/NovedadesPanel";

export default function TopBar() {
  const { user } = useUser();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const [eventsCount, setEventsCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasUnreadNews, setHasUnreadNews] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Cargar estado de novedades para clubes
  useEffect(() => {
    if (user.role === 'CLUB' || user.role === 'club') {
      const fetchClubNews = async () => {
        try {
          const res = await fetch('/api/club/me', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setHasUnreadNews(data.hasUnreadNews || false);
          }
        } catch (error) {
          console.error('Error fetching club news status:', error);
        }
      };
      fetchClubNews();
    }
  }, [user.role]);

  // Calcular días restantes de trial
  useEffect(() => {
    const isTrialAccount = (user as any).isTrialAccount;
    const trialExpiresAt = (user as any).trialExpiresAt;

    if (!isTrialAccount || !trialExpiresAt) {
      setTrialDaysLeft(null);
      return;
    }

    const calculateDaysLeft = () => {
      const now = new Date();
      const expiry = new Date(trialExpiresAt);
      const diffTime = expiry.getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTrialDaysLeft(days);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [(user as any).isTrialAccount, (user as any).trialExpiresAt]);

  // Cargar foto de perfil
  useEffect(() => {
    const photo = (user as any).profilePhoto;
    if (photo) {
      setProfilePhoto(photo);
    }
  }, [user]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
      } catch (e) { }
      window.location.href = '/login';
    }
  };

  const handleNotificationClick = () => {
    // Marcar como revisados al hacer clic
    localStorage.setItem('lastEventCheck', new Date().toISOString());
    setEventsCount(0);
    router.push('/parents/events');
  };

  const handleNovedadesClick = async () => {
    setIsPanelOpen(true);

    // Marcar novedades como leídas
    if (hasUnreadNews) {
      try {
        await fetch('/api/club/mark-news-read', {
          method: 'POST',
          credentials: 'include'
        });
        setHasUnreadNews(false);
      } catch (error) {
        console.error('Error marking news as read:', error);
      }
    }
  };

  const handleActivateTrial = async () => {
    try {
      const res = await fetch('/api/club/activate-pro-trial', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        setIsPanelOpen(false);
        // Recargar la página para actualizar el estado del club
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || 'Error al activar el trial');
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      alert('Error al activar el trial PRO');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between w-full">
      {/* Left side: Toggle sidebar button (desktop only) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
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

      {/* Right side: Trial badge + Notifications + User info + Logout */}
      <div className="flex items-center gap-3">
        {/* Trial indicator (compact) */}
        {trialDaysLeft !== null && (
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${trialDaysLeft <= 0
                ? 'bg-red-100 text-red-700'
                : trialDaysLeft <= 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            title={
              (user as any).trialExpiresAt
                ? `${trialDaysLeft <= 0 ? 'Expirado el' : 'Expira el'}: ${new Date((user as any).trialExpiresAt).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}`
                : `Tu periodo de prueba ${trialDaysLeft <= 0 ? 'ha expirado' : `expira en ${trialDaysLeft} ${trialDaysLeft === 1 ? 'día' : 'días'}`}`
            }
          >
            <span>🎉</span>
            <span>
              {trialDaysLeft <= 0
                ? 'Trial expirado'
                : `${trialDaysLeft} ${trialDaysLeft === 1 ? 'día' : 'días'} restantes`}
            </span>
          </div>
        )}

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

        {/* Novedades button (only for clubs) */}
        {(user.role === 'CLUB' || user.role === 'club') && (
          <NovedadesButton
            hasUnreadNews={hasUnreadNews}
            onClick={handleNovedadesClick}
          />
        )}

        {/* User dropdown menu */}
        <div className="relative mr-8" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Profile photo or default icon */}
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={user?.name || 'Usuario'}
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* User name (visible on all screens) */}
            <div className="flex flex-col items-start min-w-0">
              {user?.name && (
                <div className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user.name}
                </div>
              )}
            </div>

            <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User info in dropdown */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>

              {/* Mi Cuenta */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  const roleRoutes: Record<string, string> = {
                    'ADMIN': '/admin/cuenta',
                    'PARENT': '/parents/cuenta',
                    'CLUB': '/club/cuenta',
                    'TEACHER': '/profesor/cuenta'
                  };
                  router.push(roleRoutes[user.role] || '/parents/cuenta');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Mi Cuenta</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Novedades Panel */}
      {(user.role === 'CLUB' || user.role === 'club') && (
        <NovedadesPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onActivateTrial={handleActivateTrial}
        />
      )}
    </div>
  );
}
