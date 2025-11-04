"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModernSidebar from "@/components/ModernSidebar";
import TrialBanner from "@/components/TrialBanner";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/hooks/use-sidebar";
import TopBar from "@/components/TopBar";

export default function ParentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Esperar a que el usuario esté cargado antes de mostrar el contenido
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  // Redirigir si el rol no corresponde
  useEffect(() => {
    if (!loading && user && user.role && user.role !== "PARENT") {
      // Enviar a la raíz del rol correcto si existe
      const role = String(user.role).toLowerCase();
      const target = ["admin", "club", "profesor"].includes(role)
        ? `/${role}`
        : "/";
      router.replace(target);
    }
  }, [loading, user, router]);

  // Mostrar loading mientras se carga el usuario
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <ResponsiveMain>
        <TopBar />
        <div className="px-4 lg:px-6 pt-1 pb-6">
        {/* Mostrar banner de trial si aplica */}
        {/* TrialBanner internamente oculta si no es trial */}
        <TrialBanner user={{
          id: user.id,
          accountStatus: (user as any).accountStatus,
          isTrialAccount: (user as any).isTrialAccount,
          trialExpiresAt: (user as any).trialExpiresAt || null,
        }} />

          {children}
        </div>
      </ResponsiveMain>
    </div>
  );
}

// Componente interno que ajusta el margen según el estado del sidebar
function ResponsiveMain({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useSidebar();
  return (
    <main
      className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
      }`}
    >
      {children}
    </main>
  );
}