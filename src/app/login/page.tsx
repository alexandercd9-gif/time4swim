"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulación de login exitoso - Reemplazar con tu API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirección inmediata al dashboard del admin
      router.push("/admin/dashboard");
      
    } catch (error) {
      console.error("Error de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-cyan-50">
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
            Sistema Completo de Natación
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 text-center font-['Inter','System UI','Segoe UI','sans-serif'] font-medium">
            Gestión profesional de entrenamientos y competencias
          </p>
        </div>
        <ul className="space-y-5 w-full max-w-lg font-['Inter','System UI','Segoe UI','sans-serif']">
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl">
              <span role="img" aria-label="cronómetro">⏱️</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Cronómetro de precisión para entrenamientos</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl">
              <span role="img" aria-label="trofeo">🏆</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Registro y control de competencias oficiales</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-200 text-cyan-700 text-2xl">
              <span role="img" aria-label="estadísticas">📊</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Análisis de progreso y estadísticas detalladas</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-200 text-blue-700 text-2xl">
              <span role="img" aria-label="usuarios">👥</span>
            </span>
            <span className="text-gray-800 font-semibold text-base md:text-lg">Gestión de múltiples nadadores y familias</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">¡Bienvenido!</h2>
          <p className="text-gray-600 text-center mb-6">Ingresa a tu cuenta para continuar</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email con icono */}
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
                />
              </div>
            </div>
            {/* Contraseña con icono */}
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
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off">
                      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1.5 1.5 0 0 1 0-1c.46-1.18 1.13-2.28 1.98-3.23" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                      <path d="M12 5c5 0 9.27 3.11 10.94 7.5a1.5 1.5 0 0 1 0 1c-.46 1.18-1.13 2.28-1.98 3.23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye">
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
                  Procesando...
                </>
              ) : (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <a href="#" className="text-blue-600 font-semibold hover:underline">Regístrate aquí</a>
          </div>
        </div>
        {/* Demo Cronómetro */}
        <div className="w-full max-w-md mt-6 bg-[#f6fbff] border-2 border-dashed border-[#3b82f6] rounded-xl flex items-center px-4 py-3 gap-3 shadow-sm">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl">
            <span role="img" aria-label="cronómetro">⏱️</span>
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-blue-900 mb-0">Cronómetro</h3>
            <p className="text-blue-700 text-xs">Cronómetro sin registro</p>
          </div>
          <button
            type="button"
            className="px-5 py-1.5 rounded-lg border border-[#3b82f6] text-[#3b82f6] font-semibold bg-white hover:bg-blue-50 hover:text-blue-700 transition text-sm"
            onClick={() => alert('Demo Cronómetro')}
          >
            Probar
          </button>
        </div>
      </div>
    </div>
  );
}