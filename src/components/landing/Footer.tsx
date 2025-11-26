"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Producto",
      links: [
        { label: "Funciones", href: "#funciones" },
        { label: "Precios", href: "#precios" },
        { label: "Actualizaciones", href: "#" },
      ],
    },
    {
      title: "Soluciones",
      links: [
        { label: "Para Padres", href: "#padres" },
        { label: "Para Clubes", href: "#clubes" },
        { label: "Para Entrenadores", href: "#" },
      ],
    },
    {
      title: "Soporte",
      links: [
        { label: "Centro de Ayuda", href: "/help" },
        { label: "Documentación", href: "/docs" },
        { label: "Contacto", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacidad", href: "/privacy" },
        { label: "Términos", href: "/terms" },
        { label: "Seguridad", href: "/security" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer id="soporte" className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img
                src="/logo.png"
                alt="Time4Swim - Software de Cronómetro y Gestión de Natación"
                className="h-10 w-auto"
                width="160"
                height="40"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Plataforma profesional para cronometraje, gestión de entrenamientos y análisis de rendimiento en natación.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={
                          link.label === 'Privacidad' ? '/privacy' :
                          link.label === 'Términos' ? '/terms' :
                          link.label === 'Contacto' ? '/contact' : link.href
                        }
                        className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Compuimpact. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="hover:text-cyan-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
