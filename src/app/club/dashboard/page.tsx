import { ModernLoginForm } from "@/components/modern-login-form";
import { LogoDisplay } from "@/components/logo-display";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Lado izquierdo - Imagen/Hero */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {/* Patrón de ondas sutil */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M0,50 Q25,25 50,50 T100,50 V100 H0 Z" fill="rgba(79, 205, 196, 0.3)"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#waves)"/>
              </svg>
            </div>
            
            {/* Contenido del hero */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-gray-800 p-12">
              {/* Logo como fondo */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-80 z-0">
                <LogoDisplay />
              </div>
              
              <div className="text-center space-y-4 relative z-10">
                <div className="space-y-4 mt-64">
                  <h1 className="text-4xl font-bold leading-tight text-slate-700 mb-3">
                    Sistema Completo de Natación
                  </h1>
                  <p className="text-xl text-slate-600 max-w-lg mx-auto font-medium">
                    Gestión profesional de entrenamientos y competencias
                  </p>
                </div>
                
                <div className="space-y-5 text-slate-600 mt-8 max-w-lg mx-auto">
                  <div className="flex items-center gap-4 justify-start">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white text-xl">⏱️</span>
                    </div>
                    <span className="font-semibold text-base">Cronómetro de precisión para entrenamientos</span>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-start">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white text-xl">🏆</span>
                    </div>
                    <span className="font-semibold text-base">Registro y control de competencias oficiales</span>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-start">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <span className="font-semibold text-base">Análisis de progreso y estadísticas detalladas</span>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-start">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white text-xl">👥</span>
                    </div>
                    <span className="font-semibold text-base">Gestión de múltiples nadadores y familias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo móvil */}
            <div className="lg:hidden text-center mb-8">
              <div className="text-6xl mb-4">🏊‍♂️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Time4Swim</h1>
              <p className="text-gray-600">Sistema completo de gestión para natación</p>
            </div>
            
            <ModernLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
