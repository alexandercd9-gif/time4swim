import Header from "@/components/landing/Header";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section para Pricing Page - empieza desde arriba sin spacer */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Planes Transparentes para Todos
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Sin sorpresas, sin letra pequeña. Elige el plan que mejor se adapte a ti y comienza hoy mismo.
          </p>
          <p className="mt-4 text-lg text-blue-200">
            ✨ Todos los planes incluyen <span className="font-bold">30 días de prueba gratis</span>
          </p>
        </div>
      </section>

      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
