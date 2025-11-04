"use client";

import ModernSidebar from "@/components/ModernSidebar";
import TopBar from "@/components/TopBar";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1 lg:ml-80 transition-all duration-300">
        <TopBar />
        <div className="px-6 lg:px-8 pt-1 pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}