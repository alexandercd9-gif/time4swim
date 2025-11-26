"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Inicio", href: "/#inicio" },
    { label: "Funciones", href: "/#funciones" },
    { label: "Para Padres", href: "/#padres" },
    { label: "Para Clubes", href: "/#clubes" },
    { label: "Precios", href: "/#pricing" },
    { label: "Soporte", href: "/#soporte" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-lg bg-white/70 shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Time4Swim Logo"
              className={`h-12 lg:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                isScrolled ? "" : "brightness-0 invert"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-lg font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:text-cyan-600"
                    : "text-white hover:text-cyan-200"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              href="/login"
              className={`inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 ${
                isScrolled
                  ? "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? "hover:bg-gray-100"
                : "hover:bg-white/10"
            }`}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-gray-700" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-700" : "text-white"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile CTA */}
              <Link
                href="/login"
                className="block w-full text-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white font-semibold shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>

              {/* Mobile Links */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
