"use client";

import React from "react";
import { useUser } from "@/context/UserContext";

export default function TopBar() {
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      // clean local data and redirect
      try { localStorage.removeItem('token'); localStorage.removeItem('userRole'); localStorage.removeItem('userData'); } catch(e){}
      window.location.href = '/login';
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Extended logo area left - empty here, sidebar displays logo */}
        <div className="hidden sm:flex flex-col">
          {user?.name && (
            <div className="text-sm font-medium text-gray-900 truncate max-w-sm">{user.name}</div>
          )}
          {user?.email && (
            <div className="text-xs text-gray-500 truncate max-w-sm">{user.email}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Logout button: small red circle with white icon */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17l5-5-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 19H6a2 2 0 01-2-2V7a2 2 0 012-2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
