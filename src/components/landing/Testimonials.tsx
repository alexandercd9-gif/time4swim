"use client";

import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Martínez",
      role: "Entrenador Principal",
      club: "Club Natación Élite",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      quote: "Time4Swim cambió completamente cómo gestionamos el equipo. Los gráficos de evolución son increíbles y los padres están encantados.",
      rating: 5,
    },
    {
      name: "María González",
      role: "Madre de nadadora",
      club: "Familia González",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      quote: "Finalmente puedo ver el progreso real de mi hija. Cambiamos de club y no perdimos nada del historial. Simplemente perfecto.",
      rating: 5,
    },
    {
      name: "Roberto Silva",
      role: "Director Deportivo",
      club: "Centro Acuático Municipal",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
      quote: "La plataforma más completa que he probado. Reportes automáticos, cronómetro preciso y todo el equipo sincronizado.",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-12 lg:py-16 bg-white" style={{ marginTop: '-2px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold mb-4">
            <Star className="h-4 w-4 fill-current" />
            Testimonios
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Confianza de{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
              profesionales
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Clubes, entrenadores y familias confían en Time4Swim para gestionar
            sus entrenamientos y evolución.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-16 w-16 text-cyan-600" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5"
                />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-cyan-600 font-medium">{testimonial.club}</div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
