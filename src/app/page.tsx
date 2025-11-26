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
      {/* La ola ahora está integrada dentro del Hero para una transición perfecta */}
      <Benefits />
      <HowItWorks />
      <ForParents />
      {/* Eliminamos el divisor aquí porque la ola ya está integrada en ForParents */}
      <ForClubs />
      <PricingPreview />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
