"use client";

import ModernSidebar from "@/components/ModernSidebar";
import { SidebarProvider } from "@/hooks/use-sidebar";
import TopBar from "@/components/TopBar";

export default function SwimmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1 lg:ml-80 transition-all duration-300">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          <div className="mb-4">
            <TopBar />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
