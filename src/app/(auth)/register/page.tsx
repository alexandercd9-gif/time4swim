"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showTrialSuccessNotification } from "@/components/TrialNotification";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PARENT" | "CLUB" | "TEACHER">("PARENT"); // Nuevo estado para rol
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }), // Incluir rol
      });

      const data = await response.json();

      if (response.ok) {
        // Mostrar notificación bonita de éxito
        showTrialSuccessNotification({
          email: email,
          trialDays: 7
        });
        
        // Redirigir al login después de un breve delay para que vean la notificación
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'No se pudo completar el registro', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '500',
          },
        });
      }
      
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error('Error de conexión con el servidor. Intenta nuevamente.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#dc2626',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Toaster para notificaciones bonitas */}
      <Toaster position="top-center" />
      
      {/* Lado izquierdo solo visible en desktop */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center px-8 py-12">
        <img
          src="/logo.png"
          alt="Logo Time4Swim"
          className="mb-4 w-56 h-auto max-w-lg md:w-72 lg:w-80 xl:w-96 drop-shadow-lg"
          style={{ objectFit: 'contain' }}
        />
        <div className="-mt-2 mb-7 w-full flex flex-col items-center">
          <h1 className="text-[2.2rem] md:text-[2.6rem] font-bold text-blue-900 mb-2 text-center font-['Poppins','Montserrat','Segoe UI','Inter','sans-serif'] tracking-tight leading-tight">
            Únete a Time4Swim
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 text-center font-['Inter','System UI','Segoe UI','sans-serif'] font-medium">
            Comienza a gestionar tus entrenamientos hoy
          </p>
        </div>
        <ul className="space-y-5 w-full max-w-lg font-['Inter','System UI','Segoe UI','sans-serif']">
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl">
              <span role="img" aria-label="prueba gratis">✨</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">7 días de prueba gratis</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl">
              <span role="img" aria-label="cronómetro">⏱️</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Cronómetro de precisión</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl">
              <span role="img" aria-label="trofeo">🏆</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Registro de competencias</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl">
              <span role="img" aria-label="estadísticas">📊</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Estadísticas detalladas</span>
          </li>
        </ul>
      </div>

      {/* Lado derecho */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          {/* Logo solo visible en móvil */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <img
              src="/logo.png"
              alt="Logo Time4Swim"
              className="mb-2 w-32 h-auto drop-shadow-lg"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Crear Cuenta</h2>
          <p className="text-gray-600 text-center mb-6">Regístrate y obtén 30 días gratis</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Selección de Rol */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-center">
                ¿Cómo usarás Time4Swim?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Opción Padre/Madre */}
                <button
                  type="button"
                  onClick={() => setRole("PARENT")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "PARENT"
                      ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-3xl mb-2">👨‍👩‍👧</span>
                  <span className={`text-sm font-semibold ${role === "PARENT" ? "text-blue-700" : "text-gray-700"}`}>
                    Padre/Madre
                  </span>
                </button>

                {/* Opción Club */}
                <button
                  type="button"
                  onClick={() => setRole("CLUB")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "CLUB"
                      ? "border-cyan-500 bg-cyan-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-cyan-300 hover:bg-cyan-50"
                  }`}
                >
                  <span className="text-3xl mb-2">🏊‍♂️</span>
                  <span className={`text-sm font-semibold ${role === "CLUB" ? "text-cyan-700" : "text-gray-700"}`}>
                    Club
                  </span>
                </button>

                {/* Opción Entrenador */}
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "TEACHER"
                      ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
                      : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <span className="text-3xl mb-2">👨‍🏫</span>
                  <span className={`text-sm font-semibold ${role === "TEACHER" ? "text-purple-700" : "text-gray-700"}`}>
                    Entrenador
                  </span>
                </button>
              </div>
              {/* Texto descriptivo según rol seleccionado */}
              <p className="text-xs text-center text-gray-500 mt-3">
                {role === "PARENT" && "Gestiona a tus hijos nadadores y lleva su historial completo"}
                {role === "CLUB" && "Administra tu club, entrenadores y todos los nadadores"}
                {role === "TEACHER" && "Registra tiempos y gestiona entrenamientos de tus nadadores"}
              </p>
            </div>

            {/* Nombre completo */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="name">
                Nombre completo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="name"
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f1f5fa] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                  disabled={isLoading}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-[#f1f5fa] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-200 bg-[#f1f5fa] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
                  style={{ padding: 0, background: 'none', border: 'none', lineHeight: 0 }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1.5 1.5 0 0 1 0-1c.46-1.18 1.13-2.28 1.98-3.23" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                      <path d="M12 5c5 0 9.27 3.11 10.94 7.5a1.5 1.5 0 0 1 0 1c-.46 1.18-1.13 2.28-1.98 3.23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-200 bg-[#f1f5fa] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  placeholder="Confirma tu contraseña"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
                  style={{ padding: 0, background: 'none', border: 'none', lineHeight: 0 }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1.5 1.5 0 0 1 0-1c.46-1.18 1.13-2.28 1.98-3.23" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                      <path d="M12 5c5 0 9.27 3.11 10.94 7.5a1.5 1.5 0 0 1 0 1c-.46 1.18-1.13 2.28-1.98 3.23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* BOTÓN CON ESTILOS INLINE Y LOADING */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                color: 'white',
                fontWeight: '600',
                fontSize: '18px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(to right, #0891b2, #1d4ed8)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(to right, #06b6d4, #3b82f6)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </span>
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        {/* Info adicional */}
        <div className="w-full max-w-md mt-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-200 text-green-700 text-xl flex-shrink-0">
              ✨
            </span>
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">7 días de prueba gratis</h3>
              <p className="text-green-700 text-xs">
                Al registrarte obtendrás acceso completo por 7 días sin costo alguno.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Cronómetro */}
        <div className="w-full max-w-md mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-dashed border-blue-300 rounded-xl flex items-center px-4 py-3 gap-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => router.push('/demo')}
        >
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl shadow-lg flex-shrink-0">
            <span role="img" aria-label="cronómetro">⏱️</span>
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-blue-900 mb-0">Demo Cronómetro</h3>
            <p className="text-blue-700 text-xs">Prueba el cronómetro sin registro</p>
          </div>
          <button
            type="button"
            className="px-5 py-2 rounded-lg border-2 border-cyan-500 text-cyan-600 font-semibold bg-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white hover:border-transparent transition-all text-sm shadow-md hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/demo');
            }}
          >
            Probar
          </button>
        </div>
      </div>
    </div>
  );
}
