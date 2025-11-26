"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, User, MessageSquare, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: '¡Mensaje enviado exitosamente! Te responderemos pronto.' });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Error al enviar el mensaje. Por favor intenta más tarde.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión. Verifica tu internet e intenta nuevamente.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-700 text-white py-12">
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
              <Mail className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Contáctanos</h1>
              <p className="text-cyan-100">Estamos aquí para ayudarte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Envíanos un mensaje</h2>
            <p className="text-gray-600 mb-6">
              Escríbenos para soporte técnico, consultas comerciales o solicitar una demostración personalizada.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Nombre completo
                </label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Tu nombre" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="tu@email.com" 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Mensaje
                </label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="¿En qué podemos ayudarte?" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar mensaje
                  </>
                )}
              </button>

              {status && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  status.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${
                    status.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {status.message}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                O escríbenos directamente a{" "}
                <a href="mailto:acasaverde@compuimpact.pe" className="text-cyan-600 hover:underline font-semibold">
                  acasaverde@compuimpact.pe
                </a>
              </p>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Información de contacto</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:acasaverde@compuimpact.pe" className="text-cyan-600 hover:underline">
                      acasaverde@compuimpact.pe
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                    <a href="https://wa.me/51951393411" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                      +51 951 393 411
                    </a>
                    <p className="text-sm text-gray-500">Lun - Vie: 9:00 - 18:00</p>
                  </div>
                </div>


              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">¿Prefieres una demo en vivo?</h3>
              <p className="text-gray-600 mb-6">
                Agenda una demostración personalizada con nuestro equipo y descubre cómo Time4Swim 
                puede transformar la gestión de tu club o equipo de natación.
              </p>
              <Link
                href="/pricing#padres"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl border-2 border-cyan-600 text-cyan-600 font-semibold hover:bg-cyan-50 transition-all"
              >
                Solicitar demo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
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
