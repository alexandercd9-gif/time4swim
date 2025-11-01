"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ModernSidebar from "@/components/ModernSidebar";
import { useUser } from "@/context/UserContext";

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role && user.role !== "TEACHER") {
      const role = String(user.role).toLowerCase();
      const target = ["admin", "club", "parents"].includes(role)
        ? `/${role}`
        : "/";
      router.replace(target);
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1 lg:ml-80 transition-all duration-300">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
