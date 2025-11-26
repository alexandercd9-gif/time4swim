"use client";

import { Crown, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPreview() {
  return (
    <section id="pricing" className="relative py-20 bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50">
      {/* Parche sólido para asegurar transición perfecta con la ola superior */}
      <div className="absolute top-0 left-0 w-full h-20 bg-sky-50 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planes para Todos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sin sorpresas, sin letra pequeña. Todos incluyen <span className="font-bold text-blue-600">30 días gratis</span>.
          </p>
        </div>

        {/* Grid de 2 opciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Para Padres */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Para Padres</h3>
                <p className="text-gray-600">Sigue el progreso de tus hijos</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-gray-600">Desde</span>
                <span className="text-4xl font-bold text-gray-900">S/. 15</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-sm text-gray-500">Planes: Básico, Familiar y Premium</p>
            </div>

            <ul className="space-y-2 mb-6 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                De 1 a 6 nadadores
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Registro de tiempos ilimitado
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Gráficas de progreso
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Historial completo
              </li>
            </ul>

            <Link
              href="/pricing#padres"
              className="block w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              Ver Planes Padres
            </Link>
          </div>

          {/* Para Clubes */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold">
                Más Popular
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Para Clubes</h3>
                <p className="text-purple-100">Gestiona tu club profesionalmente</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-2">
                <span className="text-5xl font-bold">GRATIS</span>
                <span className="text-purple-100 ml-2">o</span>
                <span className="text-3xl font-bold ml-2">S/. 99</span>
                <span className="text-purple-100">/mes PRO</span>
              </div>
              <p className="text-sm text-purple-100">Club FREE gratis para siempre</p>
            </div>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-purple-200">✓</span>
                Nadadores ilimitados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-200">✓</span>
                Reportes avanzados (PRO)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-200">✓</span>
                Marca personalizada (PRO)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-200">✓</span>
                30 días gratis sin tarjeta (PRO)
              </li>
            </ul>

            <Link
              href="/pricing#clubes"
              className="block w-full py-3 px-6 bg-white text-purple-600 rounded-xl font-semibold text-center hover:bg-purple-50 transition-colors"
            >
              Ver Planes Clubes
            </Link>
          </div>
        </div>

        {/* CTA para ver todos los detalles */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold text-lg hover:gap-3 transition-all"
          >
            Ver todos los planes y características
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
