"use client";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b p-4">
        <div className="animate-pulse">Cargando usuario...</div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Bienvenido, {user.name || "Usuario"}
        </h1>
        {/* Resto del header */}
      </div>
    </header>
  );
}