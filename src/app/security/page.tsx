"use client";

import Link from "next/link";
import { 
  Shield, 
  Lock,
  Eye,
  Server,
  Key,
  FileCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Cloud
} from "lucide-react";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Encriptación de Datos",
      description: "Todos los datos se transmiten usando cifrado SSL/TLS de 256 bits, el mismo estándar usado por bancos",
      color: "from-blue-500 to-cyan-600",
      details: [
        "HTTPS en todas las conexiones",
        "Encriptación AES-256 en reposo",
        "Certificados SSL validados",
        "Perfect Forward Secrecy (PFS)"
      ]
    },
    {
      icon: Server,
      title: "Infraestructura Segura",
      description: "Servidores en centros de datos certificados con monitoreo 24/7 y backups automáticos",
      color: "from-cyan-600 to-blue-600",
      details: [
        "Servidores en ISO 27001",
        "Backups diarios automáticos",
        "Redundancia geográfica",
        "Monitoreo continuo"
      ]
    },
    {
      icon: Key,
      title: "Autenticación Segura",
      description: "Sistema robusto de autenticación con contraseñas hasheadas y protección contra ataques",
      color: "from-purple-600 to-pink-600",
      details: [
        "Contraseñas hasheadas con bcrypt",
        "Protección contra fuerza bruta",
        "Sesiones con tokens JWT",
        "2FA disponible (próximamente)"
      ]
    },
    {
      icon: Eye,
      title: "Control de Acceso",
      description: "Permisos granulares que determinan quién puede ver y editar cada dato",
      color: "from-pink-600 to-rose-600",
      details: [
        "Roles y permisos definidos",
        "Acceso basado en asociaciones",
        "Logs de actividad",
        "Revocación inmediata de acceso"
      ]
    },
    {
      icon: Cloud,
      title: "Backups y Recuperación",
      description: "Copias de seguridad automáticas con múltiples puntos de restauración",
      color: "from-emerald-500 to-teal-600",
      details: [
        "Backups cada 6 horas",
        "Retención de 30 días",
        "Restauración punto en tiempo",
        "Replicación multi-región"
      ]
    },
    {
      icon: FileCheck,
      title: "Cumplimiento Normativo",
      description: "Cumplimos con las principales regulaciones de protección de datos",
      color: "from-orange-500 to-red-600",
      details: [
        "GDPR compliant",
        "Política de privacidad clara",
        "Derecho al olvido",
        "Exportación de datos"
      ]
    }
  ];

  const dataOwnership = [
    {
      icon: UserCheck,
      title: "Tú eres el dueño",
      description: "Los padres son propietarios de todos los datos de sus nadadores. El club solo tiene acceso temporal mientras estén asociados."
    },
    {
      icon: Shield,
      title: "Portabilidad garantizada",
      description: "Si cambias de club, el club anterior pierde acceso automáticamente y puedes exportar todo tu historial."
    },
    {
      icon: Eye,
      title: "Control total",
      description: "Decides qué información compartes, con quién y por cuánto tiempo. Puedes revocar accesos en cualquier momento."
    }
  ];

  const certifications = [
    { name: "SSL/TLS", description: "Certificado A+ en SSLLabs" },
    { name: "ISO 27001", description: "Data centers certificados" },
    { name: "GDPR", description: "Cumplimiento europeo" },
    { name: "SOC 2", description: "En proceso de certificación" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white">
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">Seguridad</h1>
              <p className="text-xl text-blue-100 mt-2">Tu confianza es nuestra prioridad</p>
            </div>
          </div>

          <p className="text-lg text-blue-50 max-w-3xl">
            En Time4Swim tomamos la seguridad de tus datos muy en serio. 
            Implementamos las mejores prácticas de la industria para proteger tu información.
          </p>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-center gap-3 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <p className="font-semibold text-lg">
              Encriptación de grado bancario • Backups automáticos • 99.9% uptime
            </p>
          </div>
        </div>
      </div>

      {/* Data Ownership Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Propiedad y Control de Datos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En Time4Swim, los padres son los dueños de los datos. No el club, no nosotros. Tú.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {dataOwnership.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-2xl">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <p className="text-xl font-semibold mb-2">Garantía de Portabilidad</p>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Si cambias de club, el club anterior pierde acceso inmediato y automático. 
            Todo tu historial viaja contigo, siempre.
          </p>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Medidas de Seguridad</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Protección multicapa para mantener tus datos seguros en todo momento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Certificaciones y Cumplimiento</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200 text-center hover:border-blue-400 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Vulnerability */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">¿Encontraste una vulnerabilidad?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Si descubres un problema de seguridad, repórtalo responsablemente. 
            Agradecemos tu ayuda para mantener Time4Swim seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:security@time4swim.com"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-red-600 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              security@time4swim.com
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-red-700 text-white font-semibold shadow-lg hover:bg-red-800 transition-all"
            >
              Formulario de Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* Back Button */}
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
