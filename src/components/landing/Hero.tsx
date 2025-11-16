"use client";

import Link from "next/link";
import { Play } from "lucide-react";

export default function Hero() {
  return (
  <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2306b6d4;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%230ea5e9;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%232563eb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E"
          onError={(e) => {
            console.log('Error cargando video, mostrando fallback gradient');
            e.currentTarget.style.display = 'none';
          }}
        >
          {/* Video local de Time4Swim */}
          <source src="/videos/time4swim.mp4" type="video/mp4" />
        </video>
        {/* Fallback gradient background si el video no carga */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-700 -z-10" />
        {/* Overlay for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-600/40 via-blue-700/50 to-blue-900/60" />
      </div>

      {/* Animated water bubbles */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="absolute w-24 h-24 bg-white/10 rounded-full blur-xl animate-float" style={{ top: '60%', right: '15%', animationDelay: '2s' }} />
        <div className="absolute w-12 h-12 bg-white/10 rounded-full blur-xl animate-float" style={{ bottom: '30%', left: '20%', animationDelay: '4s' }} />
      </div>

      {/* Content */}
  <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Main Heading - H1 optimizado para SEO */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            Cronómetro de Natación: <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-sky-200 to-white">
              Mide, Guarda y Mejora
            </span><br />
            los Tiempos de tus Nadadores
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            El historial de natación que viaja contigo. Registra tiempos, analiza evolución 
            y <span className="font-bold text-white">lleva todos los datos aunque cambies de club</span>.
          </p>
          
          {/* Value Proposition Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white animate-in fade-in slide-in-from-bottom-4 delay-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Portabilidad total: Tus datos son tuyos, siempre</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-blue-600 font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
            >
              Probar gratis
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            
            <button
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-200"
              aria-label="Ver demo del producto"
            >
              <Play className="h-5 w-5 mr-2" />
              Ver demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Confianza de clubes profesionales</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Datos seguros y privados</span>
            </div>
          </div>
          {/* Línea fantasma bajo el hero eliminada: si existía por algún border accidental, aseguramos reset */}
          <div className="h-px w-full opacity-0 pointer-events-none select-none" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
