"use client";

import { Users, Timer, BarChart3, FileText, Award, Target } from "lucide-react";
import { useState, useEffect } from "react";

export default function ForClubs() {
  const [particles, setParticles] = useState<Array<{ top: string; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    setParticles(
      [...Array(20)].map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 10}s`,
      }))
    );
  }, []);

  const features = [
    {
      icon: Users,
      title: "Nadadores",
      description: "Gestiona tu roster completo con datos centralizados",
      stat: "Sin límite",
    },
    {
      icon: Timer,
      title: "Cronómetro",
      description: "Registra tiempos en vivo durante entrenamientos",
      stat: "Precisión milisegundos",
    },
    {
      icon: BarChart3,
      title: "Entrenamientos",
      description: "Planifica sesiones y mide resultados objetivos",
      stat: "Análisis avanzado",
    },
    {
      icon: FileText,
      title: "Reportes",
      description: "Genera informes detallados automáticamente",
      stat: "Export PDF/Excel",
    },
  ];

  const benefits = [
    "Control total del equipo desde un dashboard",
    "Comparativas entre nadadores y categorías",
    "Historial completo de cada atleta",
    "Comunicación directa con padres",
    "Estadísticas en tiempo real",
    "Integración con competencias",
  ];

  return (
    <section id="clubes" className="relative pt-32 lg:pt-48 pb-20 lg:pb-32 bg-gradient-to-b from-blue-900 via-blue-800 to-cyan-700 text-white overflow-hidden">
      {/* Ola Superior (Máscara de transición desde ForParents) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none rotate-180">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-full h-[60px] sm:h-[100px] lg:h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="#f0f9ff" // Color sky-50 (fondo de ForParents/Benefits)
          />
        </svg>
      </div>

      {/* Animated Background (small floating dots) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-float"
              style={{
                top: p.top,
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Section */}
          <div className="relative order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-cyan-100 mb-2">{feature.description}</p>
                    <span className="text-xs font-semibold text-cyan-300">{feature.stat}</span>
                  </div>
                );
              })}
            </div>

            {/* Floating Stats Card */}
            <div className="mt-6 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 delay-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Rendimiento del equipo</h4>
                  <p className="text-xs text-cyan-100">Últimos 30 días</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-xs text-cyan-100">Entrenamientos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24</div>
                  <div className="text-xs text-cyan-100">Nadadores</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-cyan-100">Récords</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold mb-6">
              <Target className="h-4 w-4" />
              Para Clubes Profesionales
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Software para Clubes de Natación:{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">
                Gestión Profesional con Datos Reales
              </span>
            </h2>

            <p className="text-lg text-cyan-50 mb-8 leading-relaxed">
              Cronómetro profesional para entrenamientos, reportes automáticos y análisis de rendimiento.
              Mide, compara y mejora los tiempos de tu equipo con herramientas diseñadas específicamente
              para la gestión profesional de clubes de natación.
            </p>

            {/* Benefits Checklist */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-cyan-50">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-blue-900 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Probar demo
                <span className="ml-2">→</span>
              </a>
              <button className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold hover:bg-white/20 transition-all duration-200">
                Solicitar presentación
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ola de salida integrada hacia Pricing */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-full h-[60px] sm:h-[100px] lg:h-[120px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="#f0f9ff" // Color sky-50 para coincidir con Pricing (celeste)
          />
        </svg>
      </div>
    </section>
  );
}
