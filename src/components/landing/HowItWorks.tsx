"use client";

import { UserPlus, Link2, TrendingUp, RefreshCw } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: "Crea tu cuenta",
      description: "Regístrate como padre o únete desde un club. Tu perfil es único y portátil.",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Link2,
      number: "02",
      title: "Asocia a tu hijo(a) al club",
      description: "Tú asocias a tu hijo(a) al club. El club podrá gestionar su perfil, pero los datos son tuyos.",
      color: "from-blue-600 to-purple-600",
    },
    {
      icon: TrendingUp,
      number: "03",
      title: "Registra y analiza",
      description: "Cronometra entrenamientos, ve gráficos de evolución y récords personales.",
      color: "from-purple-600 to-pink-600",
    },
    {
      icon: RefreshCw,
      number: "04",
      title: "Cambia de club sin perder nada",
      description: "El club anterior pierde acceso, pero todo el historial viaja contigo. Sin pérdidas.",
      color: "from-pink-600 to-rose-600",
    },
  ];

  return (
    <section id="como-funciona" className="relative py-20 lg:py-32 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-purple-100 text-purple-700 text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Proceso simple en 4 pasos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">
              Time4Swim?
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un sistema diseñado para que <strong>los padres mantengan el control</strong> de los datos 
            de sus nadadores, sin importar el club.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-cyan-200 via-purple-200 to-rose-200" style={{ width: 'calc(100% - 8rem)', left: '4rem' }} />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
              >
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-gray-50">
                    <span className={`text-lg font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key Value Proposition Banner */}
        <div className="mt-16 bg-gradient-to-r from-cyan-600 via-blue-700 to-purple-800 rounded-2xl p-8 lg:p-12 text-white text-center shadow-2xl animate-in fade-in slide-in-from-bottom-4 delay-500">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              La diferencia de Time4Swim
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              🎯 Tu historial de natación te pertenece
            </h3>
            <p className="text-lg sm:text-xl text-white/90 mb-6 leading-relaxed">
              En Time4Swim, <strong>los padres son los dueños de los datos</strong>. Tú asocias a tu hijo(a) al club, 
              y el club puede gestionar el perfil mientras estén asociados. Si cambias de club, <strong>el club anterior 
              pierde acceso y todo el historial viaja contigo</strong>. Sin pérdidas, sin empezar de cero.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Portabilidad total</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Control parental</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Sin pérdida de datos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
