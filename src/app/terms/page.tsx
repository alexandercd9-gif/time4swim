import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle, Scale, AlertTriangle, Gavel } from "lucide-react";

export const metadata = {
  title: 'Time4Swim - Términos y Condiciones',
  description: 'Términos de servicio de Time4Swim. Reglas de uso y responsabilidades para usuarios y clubes.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12">
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
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Términos y Condiciones</h1>
              <p className="text-blue-100">Acuerdo de uso de la plataforma Time4Swim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Estos términos y condiciones describen las reglas de uso de Time4Swim. Al acceder o usar la plataforma, 
            aceptas estar sujeto a estos términos. Por favor, léelos cuidadosamente.
          </p>

          <div className="space-y-10">
            <section className="border-l-4 border-green-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Uso permitido</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-3">
                El usuario se compromete a usar la plataforma de forma legal, ética y respetuosa. 
                Está prohibido:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Usar la plataforma para actividades ilegales</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Distribuir malware o contenido dañino</li>
                <li>Sobrecargar intencionalmente el sistema</li>
              </ul>
            </section>

            <section className="border-l-4 border-purple-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Propiedad intelectual</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Todos los contenidos, software, diseño, marca y código de Time4Swim son propiedad exclusiva 
                de Time4Swim o sus licenciantes. No está permitido copiar, modificar, distribuir o crear 
                trabajos derivados sin autorización expresa.
              </p>
            </section>

            <section className="border-l-4 border-orange-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Limitación de responsabilidad</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Time4Swim se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables 
                por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso 
                de la plataforma, salvo lo establecido por la ley aplicable.
              </p>
            </section>

            <section className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Gavel className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Terminación del servicio</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Nos reservamos el derecho de suspender o terminar tu acceso a la plataforma en caso de 
                incumplimiento de estos términos, sin previo aviso. Los usuarios pueden cancelar su cuenta 
                en cualquier momento desde la configuración de perfil.
              </p>
            </section>

            <section className="border-l-4 border-cyan-500 pl-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Modificaciones</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Podemos actualizar estos términos ocasionalmente. Te notificaremos sobre cambios significativos 
                por email o mediante aviso en la plataforma. El uso continuado después de las modificaciones 
                constituye aceptación de los nuevos términos.
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
