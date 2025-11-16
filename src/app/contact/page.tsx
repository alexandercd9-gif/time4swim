"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, User, MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: any) {
    e.preventDefault();
    const subject = encodeURIComponent('Contacto Time4Swim - ' + name);
    const body = encodeURIComponent(`Nombre: ${name}%0AEmail: ${email}%0A%0A${message}`);
    window.location.href = `mailto:contacto@time4swim.com?subject=${subject}&body=${body}`;
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
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <Send className="h-4 w-4" />
                Enviar mensaje
              </button>

              <p className="text-sm text-gray-500 text-center">
                O escríbenos directamente a{" "}
                <a href="mailto:contacto@time4swim.com" className="text-cyan-600 hover:underline font-semibold">
                  contacto@time4swim.com
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
                    <a href="mailto:contacto@time4swim.com" className="text-cyan-600 hover:underline">
                      contacto@time4swim.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Teléfono</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Lun - Vie: 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ubicación</h4>
                    <p className="text-gray-600">
                      123 Swimming Lane<br />
                      Miami, FL 33101<br />
                      Estados Unidos
                    </p>
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
                href="/"
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
