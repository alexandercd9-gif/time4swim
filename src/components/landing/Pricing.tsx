"use client";

import { Check, Crown, Users, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Pricing() {
  const [activeTab, setActiveTab] = useState<"parents" | "clubs">("parents");

  const parentPlans = [
    {
      id: "basic",
      name: "Básico",
      price: 15,
      description: "Perfecto para empezar",
      features: [
        "1 nadador",
        "Registro de tiempos ilimitado",
        "Historial completo, cronómetro",
        "Gráficas de progreso",
        "Comparación con récords",
        "Acceso a eventos"
      ],
      popular: false,
      color: "blue"
    },
    {
      id: "family",
      name: "Familiar",
      price: 25,
      description: "Lo más elegido",
      features: [
        "Hasta 3 nadadores",
        "Registro de tiempos ilimitado",
        "Historial completo, cronómetro",
        "Gráficas de progreso",
        "Comparación con récords",
        "Acceso a eventos"
      ],
      popular: true,
      color: "purple"
    },
    {
      id: "premium",
      name: "Premium",
      price: 40,
      description: "Para familias grandes",
      features: [
        "Hasta 6 nadadores",
        "Registro de tiempos ilimitado",
        "Historial completo, cronómetro",
        "Gráficas de progreso",
        "Comparación con récords",
        "Acceso a eventos"
      ],
      popular: false,
      color: "pink"
    }
  ];

  const clubPlans = [
    {
      name: "CLUB FREE",
      price: 0,
      description: "Gratis para siempre",
      features: [
        "Nadadores ilimitados (asignados por padres)",
        "Hasta 6 profesores",
        "Gestión de entrenamientos",
        "Registro de tiempos",
        "Calendario de eventos",
        "Estadísticas básicas",
        "Soporte por email"
      ],
      popular: false,
      color: "gray",
      trial: false
    },
    {
      name: "CLUB PRO",
      price: 99,
      description: "Profesional y completo",
      features: [
        "Todo lo de FREE +",
        "Profesores ilimitados",
        "Reportes avanzados en PDF",
        "Control de asistencias",
        "Marca personalizada (logo, colores)",
        "Dominio personalizado",
        "Integración FDPN masiva",
        "Analytics y estadísticas avanzadas",
        "Soporte prioritario 24/7"
      ],
      popular: true,
      color: "gradient",
      trial: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl shadow-lg p-2 gap-2">
            <button
              onClick={() => setActiveTab("parents")}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "parents"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <Users className="h-5 w-5" />
              Para Padres
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "clubs"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <Crown className="h-5 w-5" />
              Para Clubes
            </button>
          </div>
        </div>

        {/* Pricing para Padres */}
        {activeTab === "parents" && (
          <div id="padres" className="scroll-mt-20">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Sigue el progreso de tus hijos
              </h3>
              <p className="text-gray-600">
                Registra tiempos, analiza el rendimiento y celebra cada logro
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {parentPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${plan.popular ? "ring-4 ring-purple-500 ring-offset-4" : ""
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
                        <Star className="h-4 w-4 fill-white" />
                        Más Popular
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-gray-900">S/. {plan.price}</span>
                        <span className="text-gray-600 text-lg">/mes</span>
                      </div>
                      <p className="text-sm text-gray-500">30 días gratis de prueba</p>
                    </div>

                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <Link
                      href="/login?tab=register"
                      className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 mb-6 ${plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                    >
                      Comenzar Gratis
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing para Clubes */}
        {activeTab === "clubs" && (
          <div id="clubes" className="scroll-mt-20">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Gestiona tu club profesionalmente
              </h3>
              <p className="text-gray-600">
                Herramientas completas para administrar nadadores, profesores y competencias
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {clubPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${plan.popular ? "ring-4 ring-purple-500 ring-offset-4 scale-105" : ""
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Recomendado
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="mb-6">
                      {plan.price === 0 ? (
                        <div>
                          <span className="text-5xl font-bold text-gray-900">GRATIS</span>
                          <p className="text-sm text-gray-500 mt-2">Para siempre</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-bold text-gray-900">S/. {plan.price}</span>
                            <span className="text-gray-600 text-lg">/mes</span>
                          </div>
                          {plan.trial && (
                            <p className="text-sm text-green-600 font-medium">
                              ✨ 30 días gratis sin tarjeta
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {plan.color === "gradient" ? (
                        <Crown className="h-8 w-8 text-purple-600" />
                      ) : (
                        <Users className="h-8 w-8 text-gray-600" />
                      )}
                      <h4 className="text-2xl font-bold text-gray-900">{plan.name}</h4>
                    </div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <Link
                      href={plan.price === 0 ? "/register" : "/subscription?type=club&plan=club_pro"}
                      className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 mb-6 ${plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                    >
                      {plan.price === 0 ? "Comenzar Gratis" : "Probar 30 días GRATIS"}
                    </Link>

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-purple-600" : "text-green-600"
                            }`} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Preguntas Frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan después?
              </h4>
              <p className="text-gray-600 text-sm">
                Sí, puedes cambiar tu plan en cualquier momento desde tu dashboard. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿Qué pasa después del trial?
              </h4>
              <p className="text-gray-600 text-sm">
                Si no cancelas, se cobra automáticamente el plan elegido. Puedes cancelar en cualquier momento sin penalización.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿Aceptan todas las tarjetas?
              </h4>
              <p className="text-gray-600 text-sm">
                Aceptamos Visa, Mastercard y tarjetas peruanas a través de Culqi, nuestra pasarela de pagos segura.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">
                ¿El Club FREE tiene limitaciones?
              </h4>
              <p className="text-gray-600 text-sm">
                Club FREE es completamente funcional con nadadores ilimitados y hasta 6 profesores. Ideal para clubes pequeños.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Pago seguro procesado por</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-2xl font-bold text-gray-800">CULQI</div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>Encriptación SSL</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="h-5 w-5 text-green-600" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
