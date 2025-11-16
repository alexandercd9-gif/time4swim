import Link from "next/link";
import { Shield, ArrowLeft, Lock, Eye, UserCheck, FileCheck } from "lucide-react";

export const metadata = {
  title: 'Time4Swim - Política de Privacidad',
  description: 'Política de privacidad de Time4Swim. Cómo recopilamos, usamos y protegemos los datos de usuarios y nadadores.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
              <p className="text-cyan-100">Protegemos tus datos con total transparencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            En Time4Swim nos tomamos la privacidad muy en serio. Esta política describe qué datos recopilamos, 
            cómo los usamos y los derechos que tienes sobre tu información personal.
          </p>

          <div className="space-y-10">
            <section className="border-l-4 border-cyan-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Datos que recopilamos</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Recopilamos información de cuenta (nombre, email, club), datos de rendimiento deportivo 
                (tiempos de natación, entrenamientos, competencias) y logs de uso de la plataforma para 
                mejorar nuestro servicio.
              </p>
            </section>

            <section className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Uso de los datos</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Los datos se utilizan exclusivamente para proporcionar el servicio, mejorar tu experiencia, 
                habilitar funciones de análisis, generar reportes personalizados y comunicar actualizaciones 
                importantes del sistema.
              </p>
            </section>

            <section className="border-l-4 border-purple-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Compartición de datos</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                No vendemos ni compartimos tus datos personales con terceros para fines comerciales. 
                Podemos compartir información con proveedores de confianza únicamente para operar la plataforma 
                (hosting, base de datos, análisis).
              </p>
            </section>

            <section className="border-l-4 border-green-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Tus derechos</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Tienes derecho a solicitar acceso, rectificación, portabilidad o eliminación de tus datos. 
                Contacta a nuestro equipo de soporte en <a href="mailto:contacto@time4swim.com" className="text-cyan-600 hover:underline">contacto@time4swim.com</a> para 
                ejercer cualquiera de estos derechos.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
