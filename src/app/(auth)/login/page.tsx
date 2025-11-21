"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft, Timer, ClipboardList, BarChart2, Users, Sparkles, User as UserIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false); // login email form
  const [showRegisterOptions, setShowRegisterOptions] = useState(false); // toggle register method selection
  const [showRegisterEmailForm, setShowRegisterEmailForm] = useState(false); // register email form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"PARENT" | "CLUB" | "TEACHER">("PARENT"); // Estado para rol
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const { refetchUser } = useUser();

  useEffect(() => {
    console.log("Login page loaded");
    
    // Check for OAuth errors in URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const tab = params.get('tab');
    
    // Si viene con tab=register, abrir el modal de registro
    if (tab === 'register') {
      setShowRegisterOptions(true);
      setShowEmailForm(false);
      setShowRegisterEmailForm(false);
    }
    
    if (error) {
      const errorMessages: { [key: string]: string } = {
        'oauth_state': 'Error de seguridad OAuth. Intenta de nuevo.',
        'missing_code': 'No se recibió código de autorización.',
        'oauth_config': 'Configuración OAuth incompleta. Contacta al administrador.',
        'google_oauth': 'Error al conectar con Google. Intenta de nuevo.',
        'no_email': 'No se pudo obtener tu email de Google.'
      };
      
      toast.error(errorMessages[error] || 'Error de autenticación');
      
      // Clean URL without reloading
      window.history.replaceState({}, '', '/login');
    }
  }, []);

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userData", JSON.stringify(data.user));
        await refetchUser();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirección basada en rol
        const roleRoutes: Record<string, string> = {
          'ADMIN': '/admin/dashboard',
          'PARENT': '/parents/dashboard',
          'CLUB': '/club/dashboard',
          'TEACHER': '/profesor/dashboard'
        };
        
        const redirectPath = roleRoutes[data.user.role] || '/parents/dashboard';
        
        toast.success(`¡Bienvenido ${data.user.name}!`, {
          duration: 1500,
          position: 'top-center',
          icon: '👋',
        });
        
        // Delay para asegurar que la cookie se propague
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = redirectPath;
      } else {
        toast.error(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword, role: registerRole })
      });
      const data = await response.json();
      if (response.ok) {
        // Registro OK: intentar iniciar sesión automáticamente
        toast.success('Cuenta creada. Entrando...');
        try {
          const loginResp = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registerEmail, password: registerPassword })
          });
          const loginData = await loginResp.json();
          if (loginData.success) {
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('userRole', loginData.user.role);
            localStorage.setItem('userData', JSON.stringify(loginData.user));
            await refetchUser();
            await new Promise(resolve => setTimeout(resolve, 100));
            const roleRoutes: Record<string, string> = {
              'ADMIN': '/admin/dashboard',
              'PARENT': '/parents/dashboard',
              'CLUB': '/club/dashboard',
              'TEACHER': '/profesor/dashboard'
            };
            const redirectPath = roleRoutes[loginData.user.role] || '/parents/dashboard';
            toast.success(`¡Bienvenido ${loginData.user.name}!`);
            window.location.href = redirectPath;
          } else {
            // Si por alguna razón el login falla, volver al form de login con email prellenado
            toast.success('Cuenta creada. Inicia sesión con tu email.');
            setEmail(registerEmail);
            setShowRegisterEmailForm(false);
            setShowRegisterOptions(false);
            setShowEmailForm(true);
          }
        } catch (e) {
          toast.error('Cuenta creada, pero no se pudo iniciar sesión automáticamente');
          setEmail(registerEmail);
          setShowRegisterEmailForm(false);
          setShowRegisterOptions(false);
          setShowEmailForm(true);
        }
      } else {
        toast.error(data.message || 'Error al registrar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
  <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden bg-[linear-gradient(110deg,_#021a4b_0%,_#0284c7_50%,_#38bdf8_100%)]">
      <span className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-22 mix-blend-soft-light" />
      <span className="pointer-events-none absolute -top-40 -right-28 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-24 -left-20 h-[360px] w-[360px] rounded-full bg-[#3ec5ff]/35 blur-[120px]" />
      {/* Círculos decorativos adicionales */}
      <span className="pointer-events-none absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
      <span className="pointer-events-none absolute bottom-1/4 right-1/3 h-52 w-52 rounded-full bg-blue-400/25 blur-3xl" />
      <Toaster />
  <div className="hidden md:flex flex-1 flex-col justify-center items-center px-10 py-12 text-white">
        <img src="/logo.png" alt="Logo Time4Swim" className="mb-8 w-48 h-auto md:w-56 lg:w-64 drop-shadow-2xl brightness-0 invert" style={{ objectFit: "contain" }} />
        <div className="mb-10 w-full flex flex-col items-center">
          <h1 className="text-[1.75rem] md:text-[2.2rem] lg:text-[2.5rem] xl:text-[2.8rem] font-extrabold mb-3 text-center tracking-tight leading-none text-[#f8fafc] whitespace-nowrap">Sistema Completo de Natación</h1>
          <p className="text-base md:text-lg lg:text-xl text-cyan-50/90 text-center font-semibold drop-shadow-lg">Gestión profesional de entrenamientos y competencias</p>
        </div>
        <ul className="space-y-5 w-full max-w-lg">
          <li className="flex items-center gap-4 group transition-all duration-200 hover:translate-x-2">
            <span className="inline-flex items-center justify-center min-w-[3rem] w-12 h-12 rounded-xl bg-white/95 text-blue-600 shadow-lg">
              <Timer className="w-6 h-6" />
            </span>
            <span className="text-white font-semibold text-base md:text-lg drop-shadow-xl">Cronómetro de precisión para entrenamientos</span>
          </li>
          <li className="flex items-center gap-4 group transition-all duration-200 hover:translate-x-2">
            <span className="inline-flex items-center justify-center min-w-[3rem] w-12 h-12 rounded-xl bg-white/95 text-blue-600 shadow-lg">
              <ClipboardList className="w-6 h-6" />
            </span>
            <span className="text-white font-semibold text-base md:text-lg drop-shadow-xl">Registro y control de competencias oficiales</span>
          </li>
          <li className="flex items-center gap-4 group transition-all duration-200 hover:translate-x-2">
            <span className="inline-flex items-center justify-center min-w-[3rem] w-12 h-12 rounded-xl bg-white/95 text-blue-600 shadow-lg">
              <BarChart2 className="w-6 h-6" />
            </span>
            <span className="text-white font-semibold text-base md:text-lg drop-shadow-xl">Análisis de progreso y estadísticas detalladas</span>
          </li>
          <li className="flex items-center gap-4 group transition-all duration-200 hover:translate-x-2">
            <span className="inline-flex items-center justify-center min-w-[3rem] w-12 h-12 rounded-xl bg-white/95 text-blue-600 shadow-lg">
              <Users className="w-6 h-6" />
            </span>
            <span className="text-white font-semibold text-base md:text-lg drop-shadow-xl">Gestión de múltiples nadadores y familias</span>
          </li>
        </ul>
      </div>
      {/* Divider vertical solo visible en escritorio */}
      <div className="hidden md:flex h-auto w-px bg-white/30 mx-4 my-16" />
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:px-8 md:py-12">
        <div className="relative w-full max-w-md rounded-[40px] border border-white/40 bg-white/95 text-gray-900 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 md:p-10">
          <span className="pointer-events-none absolute -top-16 right-16 h-32 w-32 rounded-full bg-cyan-200/40 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl" />
          <div className="md:hidden flex flex-col items-center mb-6">
            <img src="/logo.png" alt="Logo Time4Swim" className="mb-2 w-28 h-auto drop-shadow-lg" style={{ objectFit: "contain" }} />
          </div>
          {/* Vista condicional: selección inicial o formulario email */}
          {/* Bloque de selección login / registro métodos */}
          {!showEmailForm && !showRegisterOptions && !showRegisterEmailForm && (
            <div className="space-y-7 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight">Inicia sesión</h2>
              <p className="text-gray-600 text-center mb-2 font-medium">Inicia sesión con uno de los métodos</p>
              <div className="flex flex-col gap-4">
                {/* Email primero */}
                <button type="button" onClick={() => setShowEmailForm(true)} className="group relative w-full rounded-2xl border-2 border-gray-200 bg-white py-4 px-6 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-bold">Continuar con Email</span>
                  </span>
                </button>
                {/* Google */}
                <button type="button" onClick={() => { window.location.href = "/api/auth/oauth/google/start"; }} className="group relative w-full rounded-2xl border-2 border-gray-200 bg-white py-4 px-6 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.3 18.8 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 16.1 5 9.2 9.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 36.6 26.6 37.5 24 37.5c-5.3 0-9.8-3.4-11.4-8l-6.6 5.1C9.2 40.5 16.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 4.9l6.2 5.2C39.5 40.3 44 35 44 25c0-1.3-.1-2.7-.4-4.5z"/></svg>
                    <span className="text-sm font-bold">Continuar con Google</span>
                  </span>
                </button>
                {/* Apple */}
                <button type="button" onClick={() => toast.error("Apple Sign-In próximamente") } className="group relative w-full rounded-2xl border-2 border-gray-200 bg-white py-4 px-6 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.455 2.256-1.215 3.09-.71.78-1.89 1.38-2.94 1.29-.09-1.11.33-2.28 1.05-3.12.75-.9 2.07-1.56 3.105-1.62.015.12.03.24.03.36m3.855 16.83c-.57 1.26-.84 1.83-1.57 2.95-1.02 1.56-2.46 3.49-4.29 3.5-1.59.015-2-.99-4.15-1-2.145-.015-2.61 1.02-4.2 1.005-1.83-.015-3.23-1.78-4.25-3.34-2.91-4.38-3.21-9.54-1.41-12.29 1.02-1.56 2.64-2.535 4.47-2.55 1.665-.03 3.24 1.11 4.29 1.11 1.05 0 2.955-1.365 4.98-1.17.846.036 3.225.342 4.755 2.587-.12.075-2.835 1.68-2.805 4.995.03 3.96 3.45 5.31 3.495 5.34"/></svg>
                    <span className="text-sm font-bold">Continuar con Apple</span>
                  </span>
                </button>
                {/* Microsoft */}
                <button type="button" onClick={() => toast.error("Microsoft próximamente") } className="group relative w-full rounded-2xl border-2 border-gray-200 bg-white py-4 px-6 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" fill="#F25022"/><rect x="13" y="3" width="8" height="8" fill="#7FBA00"/><rect x="3" y="13" width="8" height="8" fill="#00A4EF"/><rect x="13" y="13" width="8" height="8" fill="#FFB900"/></svg>
                    <span className="text-sm font-bold">Continuar con Microsoft</span>
                  </span>
                </button>
              </div>
              <div className="text-center mt-4 text-sm">
                <span className="text-gray-600 font-medium">¿No tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => { setShowRegisterOptions(true); setShowRegisterEmailForm(false); }}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors duration-200"
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          )}
          {/* LOGIN EMAIL FORM */}
          {showEmailForm && !showRegisterOptions && !showRegisterEmailForm && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
              {/* Back link */}
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="absolute left-6 top-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight">Iniciar sesión</h2>
              <p className="text-gray-600 text-center mb-2 font-medium">Ingresa tus credenciales</p>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm" htmlFor="email">Correo electrónico</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-colors group-focus-within:text-blue-700">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm" htmlFor="password">Contraseña</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-colors group-focus-within:text-blue-700">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200 hover:text-blue-600 hover:scale-110"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {isLoading ? <span className="relative">Iniciando...</span> : (
                      <span className="relative flex items-center justify-center gap-2">
                        <span>Iniciar Sesión</span>
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4 text-sm">
                <span className="text-gray-600 font-medium">¿No tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => { setShowEmailForm(false); setShowRegisterOptions(true); setShowRegisterEmailForm(false); }}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors duration-200"
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          )}
          {/* REGISTER METHOD SELECTION */}
          {showRegisterOptions && !showRegisterEmailForm && !showEmailForm && (
            <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-200">
              <button
                type="button"
                onClick={() => { setShowRegisterOptions(false); }}
                className="absolute left-6 top-6 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Atrás
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center tracking-tight">Crear cuenta</h2>
              <p className="text-sm text-gray-600 text-center mb-3 font-medium">Elige un método para registrarte</p>
              
              {/* Banner 7 días - Versión Compacta */}
              <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-r from-blue-50 to-cyan-50 p-2.5 shadow-sm mb-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-blue-900 leading-tight whitespace-nowrap">
                    🎉 30 días gratis • Prueba completa sin compromiso
                  </p>
                </div>                
              </div>

              {/* Selector de Rol - Compacto */}
              <div className="space-y-2 mb-3">
                <p className="text-xs font-semibold text-gray-700 text-center">¿Qué tipo de cuenta deseas?</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Opción Padre/Madre */}
                  <button
                    type="button"
                    onClick={() => setRegisterRole("PARENT")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                      registerRole === "PARENT"
                        ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <span className="text-xl mb-0.5">👨‍👩‍👧</span>
                    <span className={`text-[10px] font-semibold leading-tight ${registerRole === "PARENT" ? "text-blue-700" : "text-gray-700"}`}>
                      Padre/Madre
                    </span>
                  </button>

                  {/* Opción Club */}
                  <button
                    type="button"
                    onClick={() => setRegisterRole("CLUB")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                      registerRole === "CLUB"
                        ? "border-cyan-500 bg-cyan-50 shadow-md scale-105"
                        : "border-gray-200 bg-white hover:border-cyan-300 hover:bg-cyan-50"
                    }`}
                  >
                    <span className="text-xl mb-0.5">🏊‍♂️</span>
                    <span className={`text-[10px] font-semibold leading-tight ${registerRole === "CLUB" ? "text-cyan-700" : "text-gray-700"}`}>
                      Club
                    </span>
                  </button>

                  {/* Opción Entrenador */}
                  <button
                    type="button"
                    onClick={() => setRegisterRole("TEACHER")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                      registerRole === "TEACHER"
                        ? "border-purple-500 bg-purple-50 shadow-md scale-105"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    <span className="text-xl mb-0.5">👨‍🏫</span>
                    <span className={`text-[10px] font-semibold leading-tight ${registerRole === "TEACHER" ? "text-purple-700" : "text-gray-700"}`}>
                      Entrenador
                    </span>
                  </button>
                </div>
                {/* Texto descriptivo según rol seleccionado */}
                <p className="text-[10px] text-center text-gray-500 leading-tight">
                  {registerRole === "PARENT" && "Gestiona a tus hijos nadadores"}
                  {registerRole === "CLUB" && "Administra tu club completo"}
                  {registerRole === "TEACHER" && "Gestiona entrenamientos"}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Email primero */}
                <button type="button" onClick={() => { setShowRegisterEmailForm(true); setShowRegisterOptions(false); }} className="group relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-5 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-2.5">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold">Registrarme con Email</span>
                  </span>
                </button>
                {/* Google */}
                <button type="button" onClick={() => { window.location.href = `/api/auth/oauth/google/start?role=${registerRole}`; }} className="group relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-5 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 15.3 18.8 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 7.1 28 5 24 5 16.1 5 9.2 9.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 36.6 26.6 37.5 24 37.5c-5.3 0-9.8-3.4-11.4-8l-6.6 5.1C9.2 40.5 16.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2.1 3.7-3.9 4.9l6.2 5.2C39.5 40.3 44 35 44 25c0-1.3-.1-2.7-.4-4.5z"/></svg>
                    <span className="text-sm font-bold">Registrarme con Google</span>
                  </span>
                </button>
                {/* Apple */}
                <button type="button" onClick={() => toast.error('Registro con Apple próximamente')} className="group relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-5 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.455 2.256-1.215 3.09-.71.78-1.89 1.38-2.94 1.29-.09-1.11.33-2.28 1.05-3.12.75-.9 2.07-1.56 3.105-1.62.015.12.03.24.03.36m3.855 16.83c-.57 1.26-.84 1.83-1.57 2.95-1.02 1.56-2.46 3.49-4.29 3.5-1.59.015-2-.99-4.15-1-2.145-.015-2.61 1.02-4.2 1.005-1.83-.015-3.23-1.78-4.25-3.34-2.91-4.38-3.21-9.54-1.41-12.29 1.02-1.56 2.64-2.535 4.47-2.55 1.665-.03 3.24 1.11 4.29 1.11 1.05 0 2.955-1.365 4.98-1.17.846.036 3.225.342 4.755 2.587-.12.075-2.835 1.68-2.805 4.995.03 3.96 3.45 5.31 3.495 5.34"/></svg>
                    <span className="text-sm font-bold">Registrarme con Apple</span>
                  </span>
                </button>
                {/* Microsoft */}
                <button type="button" onClick={() => toast.error('Registro con Microsoft próximamente')} className="group relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-5 text-gray-800 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
                  <span className="flex items-center justify-center gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" fill="#F25022"/><rect x="13" y="3" width="8" height="8" fill="#7FBA00"/><rect x="3" y="13" width="8" height="8" fill="#00A4EF"/><rect x="13" y="13" width="8" height="8" fill="#FFB900"/></svg>
                    <span className="text-sm font-bold">Registrarme con Microsoft</span>
                  </span>
                </button>
              </div>
            </div>
          )}
          {/* REGISTER EMAIL FORM */}
          {showRegisterEmailForm && !showRegisterOptions && !showEmailForm && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-2 duration-200">
              <button
                type="button"
                onClick={() => { setShowRegisterEmailForm(false); setShowRegisterOptions(true); }}
                className="absolute left-6 top-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight">Crear cuenta</h2>
              <p className="text-gray-600 text-center font-medium">Completa tus datos</p>
              <form className="space-y-5" onSubmit={handleRegister}>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm" htmlFor="registerName">Nombre completo</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-colors group-focus-within:text-blue-700">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <input
                      id="registerName"
                      type="text"
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={registerName}
                      onChange={e => setRegisterName(e.target.value)}
                      required
                      disabled={isRegistering}
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm" htmlFor="registerEmail">Correo electrónico</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-colors group-focus-within:text-blue-700">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      id="registerEmail"
                      type="email"
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      required
                      disabled={isRegistering}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm" htmlFor="registerPassword">Contraseña</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-colors group-focus-within:text-blue-700">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      id="registerPassword"
                      type={showRegisterPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-12 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      value={registerPassword}
                      onChange={e => setRegisterPassword(e.target.value)}
                      required
                      disabled={isRegistering}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-200 hover:text-blue-600 hover:scale-110"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      disabled={isRegistering}
                      aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6] py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {isRegistering ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </form>
              <div className="text-center mt-2 text-sm">
                <span className="text-gray-600 font-medium">¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => { setShowRegisterEmailForm(false); setShowRegisterOptions(false); setShowEmailForm(true); }}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors duration-200"
                >
                  Inicia sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
