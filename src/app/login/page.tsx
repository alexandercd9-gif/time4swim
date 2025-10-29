"use client";

import { useState } from "react";

export default function LoginPage() {
  // Estados para email y password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Manejo de submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la integración con autenticación y roles
    alert(`Login: ${email} / ${password}`);
  };

    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* Lado izquierdo */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
          {/* Solo el logo centrado, tamaño anterior */}
          <img
            src="/logo.png"
            alt="Logo Time4Swim"
            className="mb-4 w-56 h-auto max-w-lg md:w-72 lg:w-80 xl:w-96 drop-shadow-lg"
            style={{ objectFit: 'contain' }}
          />
          {/* Título y subtítulo con fuente moderna y más arriba */}
          <div className="-mt-2 mb-6 w-full flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-semibold font-sans tracking-tight text-blue-900 mb-2 text-center" style={{fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif'}}>
              Sistema Completo de Natación
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-4 text-center font-normal" style={{fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif'}}>
              Gestión profesional de entrenamientos y competencias
            </p>
          </div>
          <ul className="space-y-6 w-full max-w-lg" style={{fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif'}}>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-200 text-cyan-700 text-xl">
              <span role="img" aria-label="cronómetro">⏱️</span>
            </span>
            <span className="text-gray-700 font-medium">
              Cronómetro de precisión para entrenamientos
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-700 text-xl">
              <span role="img" aria-label="trofeo">🏆</span>
            </span>
            <span className="text-gray-700 font-medium">
              Registro y control de competencias oficiales
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-200 text-cyan-700 text-xl">
              <span role="img" aria-label="estadísticas">📊</span>
            </span>
            <span className="text-gray-700 font-medium">
              Análisis de progreso y estadísticas detalladas
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-700 text-xl">
              <span role="img" aria-label="usuarios">👥</span>
            </span>
            <span className="text-gray-700 font-medium">
              Gestión de múltiples nadadores y familias
            </span>
          </li>
        </ul>
      </div>

      {/* Lado derecho */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">¡Bienvenido!</h2>
          <p className="text-gray-600 text-center mb-6">Ingresa a tu cuenta para continuar</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email con icono */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                {/* Icono email SVG outline moderno */}
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
                />
              </div>
            </div>
            {/* Contraseña con icono */}
            <div>
              <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                {/* Icono candado SVG outline moderno */}
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
                />
                {/* Icono ojito outline moderno */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition"
                  style={{ padding: 0, background: 'none', border: 'none', lineHeight: 0 }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    // Ojito cerrado (outline)
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye-off">
                      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a1.5 1.5 0 0 1 0-1c.46-1.18 1.13-2.28 1.98-3.23" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                      <path d="M12 5c5 0 9.27 3.11 10.94 7.5a1.5 1.5 0 0 1 0 1c-.46 1.18-1.13 2.28-1.98 3.23" />
                    </svg>
                  ) : (
                    // Ojito abierto (outline)
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-eye">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow hover:from-cyan-600 hover:to-blue-700 transition"
            >
              Iniciar Sesión
            </button>
          </form>
          <div className="text-center mt-4">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <a href="#" className="text-blue-600 font-semibold hover:underline">Regístrate aquí</a>
          </div>
        </div>
        {/* Demo Cronómetro */}
        <div className="w-full max-w-md mt-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-2xl">
              <span role="img" aria-label="cronómetro">⏱️</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-blue-900">Demo Cronómetro</h3>
              <p className="text-blue-700 text-sm">Cronómetro sin registro</p>
            </div>
          </div>
          <button
            type="button"
            className="px-6 py-2 rounded-lg border-2 border-cyan-500 text-cyan-600 font-semibold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white transition"
            onClick={() => alert('Demo Cronómetro')}
          >
            Probar
          </button>
        </div>
      </div>
    </div>
  );
}