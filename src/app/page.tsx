import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import WaveDivider from "@/components/landing/WaveDivider";
import ForParents from "@/components/landing/ForParents";
import ForClubs from "@/components/landing/ForClubs";
import PricingPreview from "@/components/landing/PricingPreview";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
  {/* Movemos la ola 1px hacia arriba para evitar cualquier línea fantasma entre hero y la ola */}
  <WaveDivider color="#F8FAFC" yOffset={-1} />
      <Benefits />
      <HowItWorks />
  <ForParents />
  {/* Eliminamos el divisor aquí y formamos la ola dentro de ForClubs para que el fondo sea continuo */}
    {/* Ajustamos offsets y yOffset para intentar alineación más suave con el bloque de clubes */}
    {/* Ola sólida sin degradado para una separación más limpia */}
    <WaveDivider color="#1E3A8A" yOffset={2} />
        <ForClubs />
      <div className="relative" style={{ marginTop: '-2px', marginBottom: '-2px' }}>
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
          style={{ display: 'block', lineHeight: 0, transform: 'rotate(180deg)', verticalAlign: 'bottom' }}
        >
          <defs>
            <linearGradient id="clubToTestimonial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="url(#clubToTestimonial)"
          />
        </svg>
      </div>
      <PricingPreview />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
