"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ModernSidebar from "@/components/ModernSidebar";
import TopBar from "@/components/TopBar";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/hooks/use-sidebar";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const { isSidebarCollapsed } = useSidebar();

  useEffect(() => {
    if (!loading && user && user.role && user.role !== "CLUB") {
      const role = String(user.role).toLowerCase();
      const target = ["admin", "parents", "profesor"].includes(role)
        ? `/${role}`
        : "/";
      router.replace(target);
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}
        `}
      >
        <TopBar />
        <div className="px-6 lg:px-8 pt-1 pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}