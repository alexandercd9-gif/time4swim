"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refetchUser } = useUser();

  useEffect(() => {
    console.log("Login page loaded");
  }, []);

  const normalizeRole = (role: string) => {
    const normalized = role.toLowerCase().trim();
    const roleMap: { [key: string]: string } = {
      admin: "admin", parent: "parents", parents: "parents",
      club: "club", teacher: "profesor", coach: "profesor",
      profesor: "profesor", swimmer: "swimmer"
    };
    return roleMap[normalized] || normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        const normalizedRole = normalizeRole(data.user.role);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", normalizedRole);
        localStorage.setItem("userData", JSON.stringify(data.user));
        await refetchUser();
        await new Promise(resolve => setTimeout(resolve, 100));
        const redirectPaths = {
          admin: "/admin/dashboard", parents: "/parents/dashboard",
          club: "/club/dashboard", profesor: "/profesor/dashboard",
          swimmer: "/swimmer/dashboard"
        };
        const redirectPath = redirectPaths[normalizedRole as keyof typeof redirectPaths];
        router.push(redirectPath || "/dashboard");
      } else {
        toast.error(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-cyan-50">
      <Toaster />
      <div className="hidden md:flex flex-1 flex-col justify-center items-center px-8 py-12">
        <img src="/logo.png" alt="Logo Time4Swim" className="mb-4 w-56 h-auto max-w-lg md:w-72 lg:w-80 xl:w-96 drop-shadow-lg" style={{ objectFit: "contain" }} />
        <div className="-mt-2 mb-7 w-full flex flex-col items-center">
          <h1 className="text-[2.2rem] md:text-[2.6rem] font-bold text-blue-900 mb-2 text-center tracking-tight leading-tight">Sistema Completo de Natación</h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 text-center font-medium">Gestión profesional de entrenamientos y competencias</p>
        </div>
        <ul className="space-y-5 w-full max-w-lg">
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl"></span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Cronómetro de precisión para entrenamientos</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl"></span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Registro y control de competencias oficiales</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl"></span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Análisis de progreso y estadísticas detalladas</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl"></span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Gestión de múltiples nadadores y familias</span>
          </li>
        </ul>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-2xl p-10">
          <div className="md:hidden flex flex-col items-center mb-6">
            <img src="/logo.png" alt="Logo Time4Swim" className="mb-2 w-32 h-auto drop-shadow-lg" style={{ objectFit: "contain" }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">¡Bienvenido!</h2>
          <p className="text-gray-600 text-center mb-6">Ingresa a tu cuenta para continuar</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-11 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-11 py-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 py-3.5 text-base font-semibold text-white shadow-xl transition hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-600 disabled:opacity-60"
            >
              {isLoading ? "Iniciando..." : <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>}
            </button>
          </form>
          <div className="text-center mt-4">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">Regístrate aquí</Link>
          </div>
          <div className="relative text-center mt-6 mb-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <span className="relative bg-white px-3 text-xs uppercase text-gray-500 font-medium">o continúa con</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => { window.location.href = "/api/auth/oauth/google/start"; }} className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 bg-white py-3 text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.3 18.8 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 16.1 5 9.2 9.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 36.6 26.6 37.5 24 37.5c-5.3 0-9.8-3.4-11.4-8l-6.6 5.1C9.2 40.5 16.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 4.9l6.2 5.2C39.5 40.3 44 35 44 25c0-1.3-.1-2.7-.4-4.5z"/></svg>
              <span className="font-semibold text-sm">Google</span>
            </button>
            <button type="button" onClick={() => toast.error("Apple Sign-In próximamente")} className="flex items-center justify-center gap-2 w-full rounded-xl border border-gray-200 bg-white py-3 text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.455 2.256-1.215 3.09-.71.78-1.89 1.38-2.94 1.29-.09-1.11.33-2.28 1.05-3.12.75-.9 2.07-1.56 3.105-1.62.015.12.03.24.03.36m3.855 16.83c-.57 1.26-.84 1.83-1.57 2.95-1.02 1.56-2.46 3.49-4.29 3.5-1.59.015-2-.99-4.15-1-2.145-.015-2.61 1.02-4.2 1.005-1.83-.015-3.23-1.78-4.25-3.34-2.91-4.38-3.21-9.54-1.41-12.29 1.02-1.56 2.64-2.535 4.47-2.55 1.665-.03 3.24 1.11 4.29 1.11 1.05 0 2.955-1.365 4.98-1.17.846.036 3.225.342 4.755 2.587-.12.075-2.835 1.68-2.805 4.995.03 3.96 3.45 5.31 3.495 5.34"/></svg>
              <span className="font-semibold text-sm">Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
