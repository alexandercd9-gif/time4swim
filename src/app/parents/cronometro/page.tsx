import SwimmerSelectStopwatch from "./SwimmerSelectStopwatch";
import BestTimesByStyle from "@/components/BestTimesByStyle";

export default function ParentChronoPage() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Cronómetro y Tiempos</h1>
      <SwimmerSelectStopwatch />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Mejores tiempos por estilo</h2>
        <BestTimesByStyle />
      </div>
    </main>
  );
}
