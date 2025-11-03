import SwimmerSelectStopwatch from "./SwimmerSelectStopwatch";
import BestTimesByStyle from "@/components/BestTimesByStyle";

export default function ParentChronoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header consistente con otras páginas */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cronómetro de Entrenamientos</h1>
          <p className="text-gray-600">Registra tiempos, guarda sesiones y consulta mejores marcas</p>
        </div>

        <SwimmerSelectStopwatch />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Mejores tiempos por estilo</h2>
          <BestTimesByStyle />
        </div>
      </div>
    </div>
  );
}
