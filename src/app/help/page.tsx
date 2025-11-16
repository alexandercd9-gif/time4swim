"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Users,
  Clock,
  Shield,
  Smartphone,
  CreditCard,
  Settings
} from "lucide-react";

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    {
      icon: Users,
      title: "Cuentas y Usuarios",
      color: "from-cyan-500 to-blue-600",
      faqs: [
        {
          question: "¿Cómo creo una cuenta en Time4Swim?",
          answer: "Haz clic en 'Registrarse' en la página principal. Completa tus datos personales y elige si eres padre/madre o representante de un club. La cuenta es gratuita y se activa inmediatamente."
        },
        {
          question: "¿Puedo tener múltiples nadadores en mi cuenta?",
          answer: "Sí, como padre/madre puedes asociar a todos tus hijos nadadores en una sola cuenta. No hay límite en el número de nadadores que puedes gestionar."
        },
        {
          question: "¿Cómo asocio a mi hijo(a) a un club?",
          answer: "Desde tu perfil de padre/madre, ve a 'Mis Nadadores' y selecciona 'Asociar a club'. El club podrá gestionar el perfil mientras estén asociados, pero los datos siempre son tuyos."
        }
      ]
    },
    {
      icon: Clock,
      title: "Cronometraje y Tiempos",
      color: "from-blue-600 to-purple-600",
      faqs: [
        {
          question: "¿Cómo registro un tiempo de natación?",
          answer: "Ve a la sección 'Cronómetro', selecciona el nadador, elige el estilo (libre, espalda, pecho, mariposa) y la distancia. Pulsa START para comenzar y STOP al finalizar. El tiempo se guarda automáticamente."
        },
        {
          question: "¿Puedo editar un tiempo ya registrado?",
          answer: "Sí, ve al historial del nadador, busca el registro que deseas editar, haz clic en los tres puntos y selecciona 'Editar'. Solo el creador del registro o el administrador del club pueden editar tiempos."
        },
        {
          question: "¿Los tiempos se sincronizan automáticamente?",
          answer: "Sí, todos los tiempos se guardan en la nube y se sincronizan automáticamente entre todos tus dispositivos conectados."
        }
      ]
    },
    {
      icon: Shield,
      title: "Portabilidad y Privacidad",
      color: "from-purple-600 to-pink-600",
      faqs: [
        {
          question: "¿Qué pasa con los datos si cambio de club?",
          answer: "Tú eres el dueño de los datos. Si cambias de club, el club anterior pierde acceso al perfil de tu hijo(a), pero TODO el historial (tiempos, evolución, estadísticas) viaja contigo. Sin pérdidas."
        },
        {
          question: "¿El club puede ver los datos de mi hijo(a)?",
          answer: "Solo mientras tu hijo(a) esté asociado al club. El club puede gestionar el perfil, registrar tiempos y ver estadísticas. Al desasociar, el club pierde acceso inmediatamente."
        },
        {
          question: "¿Puedo exportar los datos de mi hijo(a)?",
          answer: "Sí, desde tu perfil puedes exportar todo el historial en formato PDF o Excel. Ve a 'Mi Nadador' → 'Exportar Historial'."
        }
      ]
    },
    {
      icon: Smartphone,
      title: "Aplicación y Dispositivos",
      color: "from-pink-600 to-rose-600",
      faqs: [
        {
          question: "¿Funciona sin internet?",
          answer: "Sí, puedes cronometrar y registrar tiempos sin conexión. Los datos se sincronizarán automáticamente cuando recuperes conexión a internet."
        },
        {
          question: "¿Está disponible en iOS y Android?",
          answer: "Actualmente Time4Swim funciona como aplicación web responsive, compatible con cualquier navegador en móvil, tablet o computadora. Estamos trabajando en apps nativas."
        },
        {
          question: "¿Puedo usar la misma cuenta en varios dispositivos?",
          answer: "Sí, inicia sesión con tu cuenta en cualquier dispositivo y todos tus datos estarán disponibles y sincronizados."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Precios y Planes",
      color: "from-emerald-500 to-teal-600",
      faqs: [
        {
          question: "¿Time4Swim es gratis?",
          answer: "Sí, Time4Swim es 100% gratuito para padres y nadadores. Los clubes pueden usar la versión básica gratis o contratar funciones premium para gestión avanzada."
        },
        {
          question: "¿Qué incluye el plan gratuito?",
          answer: "Cronometraje ilimitado, historial completo, gráficos de evolución, récords personales, portabilidad de datos y soporte por email."
        },
        {
          question: "¿Los clubes pagan por cada nadador?",
          answer: "No, los clubes pagan una suscripción mensual o anual según el número de entrenadores y funciones avanzadas que necesiten, no por nadador."
        }
      ]
    },
    {
      icon: Settings,
      title: "Configuración y Soporte",
      color: "from-orange-500 to-red-600",
      faqs: [
        {
          question: "¿Cómo cambio mi contraseña?",
          answer: "Ve a 'Mi Perfil' → 'Seguridad' → 'Cambiar Contraseña'. Ingresa tu contraseña actual y la nueva contraseña dos veces."
        },
        {
          question: "¿Cómo contacto con soporte técnico?",
          answer: "Puedes contactarnos por email a soporte@time4swim.com, usar el formulario de contacto en la web, o enviarnos un mensaje por nuestras redes sociales. Respondemos en menos de 24 horas."
        },
        {
          question: "¿Puedo eliminar mi cuenta?",
          answer: "Sí, ve a 'Mi Perfil' → 'Configuración' → 'Eliminar Cuenta'. Ten en cuenta que esta acción es irreversible y se eliminarán todos los datos asociados."
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">Centro de Ayuda</h1>
              <p className="text-xl text-blue-100 mt-2">Preguntas Frecuentes y Soporte</p>
            </div>
          </div>

          <p className="text-lg text-blue-50 max-w-3xl">
            Encuentra respuestas rápidas a las preguntas más comunes sobre Time4Swim. 
            Si no encuentras lo que buscas, no dudes en contactarnos.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
            />
          </div>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-600">
              Mostrando {filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)} resultados
            </p>
          )}
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredCategories.map((category, catIndex) => {
              const Icon = category.icon;
              return (
                <div key={catIndex} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>

                  {/* FAQs */}
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = catIndex * 100 + faqIndex;
                    const isOpen = openFaq === globalIndex;

                    return (
                      <div
                        key={faqIndex}
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 flex-1">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">¿No encontraste lo que buscabas?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de soporte está listo para ayudarte. Contáctanos y responderemos en menos de 24 horas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Contactar Soporte
              <span className="ml-2">→</span>
            </Link>
            <a
              href="mailto:soporte@time4swim.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-blue-700 text-white font-semibold shadow-lg hover:bg-blue-800 transition-all"
            >
              soporte@time4swim.com
            </a>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
