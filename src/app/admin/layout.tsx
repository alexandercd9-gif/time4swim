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
        <div className="p-6 lg:p-8">
          <div className="mb-4">
            <TopBar />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}