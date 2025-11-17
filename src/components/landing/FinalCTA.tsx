"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
     <section className="relative py-20 lg:py-32 overflow-hidden">
       {/* Video Background */}
       <div className="absolute inset-0 z-0">
         <video
           autoPlay
           loop
           muted
           playsInline
           preload="auto"
           className="absolute inset-0 w-full h-full object-cover"
         >
           <source src="/videos/time4swim1.mp4" type="video/mp4" />
         </video>
         {/* Fallback gradient background */}
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 -z-10" />
         {/* Overlay for contrast */}
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/70 via-blue-700/70 to-blue-900/70" />
       </div>

  {/* Animated Wave Patterns (sutiles) */}
  <div className="absolute inset-0 z-10 opacity-[0.06]">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="white" strokeWidth="2" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>
      </div>

      {/* Floating Elements */}
    <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-semibold mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="h-4 w-4" />
          Comienza tu prueba gratuita hoy
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Empieza hoy a medir la<br />
          evolución de tu equipo
        </h2>

        {/* Description */}
        <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          Únete a clubes y familias que ya confían en Time4Swim para llevar
          sus entrenamientos al siguiente nivel.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-blue-600 font-bold text-lg shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-200"
          >
            Probar gratis
            <ArrowRight className="ml-2 h-5 w-5 group-hover:.\deploy-new.ps1 translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            Iniciar sesión
          </Link>
        </div>

  {/* Trust Indicators (sin borde superior para evitar línea visible) */}
  <div className="mt-12 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>7 días gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
