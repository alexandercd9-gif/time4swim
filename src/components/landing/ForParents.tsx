"use client";

import { Heart, Shield, TrendingUp, Users } from "lucide-react";

export default function ForParents() {
  const features = [
    {
      icon: Shield,
      title: "Portabilidad total",
      description: "Cambia de club sin perder el historial completo de tu nadador.",
    },
    {
      icon: TrendingUp,
      title: "Seguimiento claro",
      description: "Gráficos intuitivos muestran la evolución en cada estilo.",
    },
    {
      icon: Heart,
      title: "Datos seguros",
      description: "Privacidad garantizada para toda la información familiar.",
    },
    {
      icon: Users,
      title: "Múltiples nadadores",
      description: "Gestiona todos tus hijos desde una sola cuenta.",
    },
  ];

  return (
    <section id="padres" className="relative py-20 lg:py-32 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/50 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold mb-6">
              <Heart className="h-4 w-4" />
              Para Familias
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Historial de Natación Portátil:{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                Todos los Tiempos de tus Hijos en un Solo Lugar
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              <strong>Tus datos son tuyos, no del club.</strong> Tú asocias a tu hijo(a) al club, y mientras estén asociados, 
              el club puede gestionar su perfil. Pero <strong>si cambias de club, el anterior pierde acceso</strong> y 
              todo el historial (marcas, evolución, estadísticas) <strong>viaja contigo</strong>. Sin pérdidas, siempre bajo tu control.
            </p>
            
            {/* Additional Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 mb-6">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">
                Tú asocias • Club gestiona • Si cambias, pierden acceso
              </span>
            </div>

            {/* Feature List */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Comenzar ahora
              <span className="ml-2">→</span>
            </a>
          </div>

          {/* Visual Mockup */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Evolución - 50m Libre</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                    -2.4s este mes
                  </span>
                </div>
                
                {/* Mock Chart */}
                <div className="h-48 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 mb-4 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 100 L 60 80 L 120 70 L 180 65 L 240 50 L 300 40"
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 100 L 60 80 L 120 70 L 180 65 L 240 50 L 300 40 L 300 150 L 0 150 Z"
                      fill="url(#chartGradient)"
                    />
                    {[0, 60, 120, 180, 240, 300].map((x, i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={i === 0 ? 100 : i === 1 ? 80 : i === 2 ? 70 : i === 3 ? 65 : i === 4 ? 50 : 40}
                        r="4"
                        fill="#06B6D4"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Best Times List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥇</span>
                      <span className="font-semibold text-gray-900">50m Libre</span>
                    </div>
                    <span className="font-bold text-green-600">00:28.45</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥈</span>
                      <span className="font-semibold text-gray-900">50m Espalda</span>
                    </div>
                    <span className="font-bold text-blue-600">00:32.12</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-lg animate-bounce">
                ⭐ Nuevo récord
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
