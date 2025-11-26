"use client";

import ModernSidebar from "@/components/ModernSidebar";
import TopBar from "@/components/TopBar";
import { useSidebar } from "@/hooks/use-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}
        `}
      >
        <div className="sticky top-0 z-40 backdrop-blur-sm bg-white/95 shadow-sm">
          <TopBar />
        </div>
        <div className="px-6 lg:px-8 pt-1 pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}