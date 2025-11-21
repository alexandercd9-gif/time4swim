import SwimmerSelectStopwatch from "./SwimmerSelectStopwatch";
import BestHistorySwitcher from "@/components/BestHistorySwitcher";
import { Timer } from "lucide-react";

export default function ParentChronoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-x-hidden">
  <div className="max-w-7xl mx-auto">
        {/* Header consistente con otras páginas */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Timer className="h-7 w-7 text-blue-600" />
            Cronómetro de Entrenamientos
          </h1>
          <p className="text-gray-600">Registra tiempos, guarda sesiones y consulta mejores marcas</p>
        </div>

        <SwimmerSelectStopwatch />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Mejores y Historial
          </h2>
          <BestHistorySwitcher defaultSource="TRAINING" />
        </div>
      </div>
    </div>
  );
}
