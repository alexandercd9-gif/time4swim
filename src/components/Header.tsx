"use client";
import { useUser } from "@/context/UserContext";
import { Bell, User } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md shadow-sm glassmorphism">
      <div className="text-lg font-bold text-blue-900">Bienvenido, {user.name}</div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={22} className="text-blue-700" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <User size={22} className="text-blue-700" />
          <span className="font-medium text-blue-900">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
