"use client";

import { Navigation } from "@/components/navigation";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { useEffect, useState } from "react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: 'ADMIN' | 'PARENT';
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Si no está autenticado, redirigir al login
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      {/* Contenido principal */}
      <main className={`pt-16 lg:pt-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}