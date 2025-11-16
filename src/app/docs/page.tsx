"use client";

import Link from "next/link";
import { 
  BookOpen, 
  PlayCircle,
  Users,
  Timer,
  BarChart3,
  Settings,
  Shield,
  Smartphone,
  Download,
  ExternalLink
} from "lucide-react";

export default function DocsPage() {
  const guides = [
    {
      icon: PlayCircle,
      title: "Primeros Pasos",
      description: "Aprende a configurar tu cuenta y comenzar a usar Time4Swim",
      color: "from-cyan-500 to-blue-600",
      items: [
        "Crear tu cuenta de padre/madre",
        "Registrar tus nadadores",
        "Asociar nadadores a un club",
        "Configurar notificaciones"
      ]
    },
    {
      icon: Timer,
      title: "Cronometraje",
      description: "Todo sobre cómo registrar y gestionar tiempos de natación",
      color: "from-blue-600 to-purple-600",
      items: [
        "Usar el cronómetro digital",
        "Registrar tiempos manualmente",
        "Editar y eliminar registros",
        "Cronometraje sin conexión"
      ]
    },
    {
      icon: Users,
      title: "Gestión de Nadadores",
      description: "Administra los perfiles de tus nadadores",
      color: "from-purple-600 to-pink-600",
      items: [
        "Crear perfil de nadador",
        "Asociar/desasociar de clubes",
        "Ver historial completo",
        "Exportar datos"
      ]
    },
    {
      icon: BarChart3,
      title: "Análisis y Estadísticas",
      description: "Interpreta los datos de evolución y rendimiento",
      color: "from-pink-600 to-rose-600",
      items: [
        "Gráficos de progresión",
        "Récords personales",
        "Comparativas por estilo",
        "Proyecciones de mejora"
      ]
    },
    {
      icon: Shield,
      title: "Portabilidad de Datos",
      description: "Cómo funciona el sistema de datos portátiles",
      color: "from-emerald-500 to-teal-600",
      items: [
        "Quién es dueño de los datos",
        "Cambiar de club sin pérdidas",
        "Exportar historial completo",
        "Control de acceso por club"
      ]
    },
    {
      icon: Settings,
      title: "Configuración Avanzada",
      description: "Personaliza tu experiencia en Time4Swim",
      color: "from-orange-500 to-red-600",
      items: [
        "Ajustes de privacidad",
        "Notificaciones y alertas",
        "Sincronización de dispositivos",
        "Gestión de sesiones"
      ]
    }
  ];

  const quickLinks = [
    {
      icon: Smartphone,
      title: "Guía de Inicio Rápido",
      description: "Comienza en 5 minutos",
      link: "#",
      badge: "PDF"
    },
    {
      icon: PlayCircle,
      title: "Video Tutoriales",
      description: "Aprende viendo",
      link: "#",
      badge: "YouTube"
    },
    {
      icon: Download,
      title: "Manual Completo",
      description: "Documentación detallada",
      link: "#",
      badge: "PDF"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white">
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
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">Documentación</h1>
              <p className="text-xl text-purple-100 mt-2">Guías completas para usar Time4Swim</p>
            </div>
          </div>

          <p className="text-lg text-purple-50 max-w-3xl">
            Todo lo que necesitas saber para aprovechar al máximo Time4Swim. 
            Desde configuración inicial hasta funciones avanzadas.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={index}
                href={link.link}
                className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 hover:shadow-3xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    {link.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 text-sm">{link.description}</p>
                <div className="mt-4 flex items-center gap-2 text-purple-600 font-semibold text-sm">
                  Ver recurso
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Guides Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Guías por Categoría</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestras guías organizadas por temas para encontrar rápidamente lo que necesitas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {/* Icon Header */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${guide.color} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>

                {/* Items List */}
                <ul className="space-y-2 mb-6">
                  {guide.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className="w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold transition-colors flex items-center justify-center gap-2 group">
                  Leer guía
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Tutorials Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <PlayCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">¿Prefieres aprender con videos?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Accede a nuestra biblioteca de video tutoriales paso a paso. 
            Perfectos para aprendices visuales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-purple-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Ver Tutoriales en Video
              <PlayCircle className="ml-2 h-5 w-5" />
            </a>
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-purple-700 text-white font-semibold shadow-lg hover:bg-purple-800 transition-all"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </div>

      {/* API Documentation (Future) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                Próximamente
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">API para Desarrolladores</h2>
              <p className="text-lg text-gray-600 mb-6">
                Estamos trabajando en una API REST completa para que desarrolladores puedan integrar 
                Time4Swim con otras plataformas y crear aplicaciones personalizadas.
              </p>
              <ul className="space-y-3">
                {["Endpoints REST completos", "Webhooks en tiempo real", "Documentación interactiva", "SDKs para múltiples lenguajes"].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-dashed border-purple-200">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                <code>{`// Ejemplo de uso de la API
const response = await fetch(
  'https://api.time4swim.com/v1/swimmers',
  {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  }
);

const swimmers = await response.json();`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
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
