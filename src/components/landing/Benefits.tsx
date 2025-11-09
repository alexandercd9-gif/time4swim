"use client";

import { Timer, BarChart3, Calendar, Users, Medal, TrendingUp } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: Timer,
      title: "Cronómetro inteligente",
      description: "Registra y guarda tiempos por sesión con precisión profesional.",
      gradient: "from-cyan-400 to-sky-500",
    },
    {
      icon: BarChart3,
      title: "Evolución con gráficos",
      description: "Compara marcas y progresos con visualizaciones claras y detalladas.",
      gradient: "from-sky-500 to-blue-600",
    },
    {
      icon: Calendar,
      title: "Gestión de entrenamientos",
      description: "Planifica y analiza sesiones completas de forma organizada.",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      icon: Users,
      title: "Para Clubes",
      description: "Control de nadadores y reportes claros para todo el equipo.",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Para Padres",
      description: "El historial viaja con tu familia, sin importar el club.",
      gradient: "from-purple-600 to-pink-500",
    },
    {
      icon: Medal,
      title: "Medallero y récords",
      description: "Mejores marcas por estilo y distancia, siempre actualizadas.",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section id="funciones" className="relative py-20 lg:py-32 bg-gradient-to-b from-sky-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            Funcionalidades completas
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas en una{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
              plataforma
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas profesionales diseñadas para mejorar el rendimiento
            de nadadores, clubes y familias.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
              >
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${benefit.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
