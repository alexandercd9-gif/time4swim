import { Waves } from "lucide-react";

export default function SwimmerDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-2 flex items-center justify-center gap-2">
          <Waves className="h-7 w-7 text-blue-600" />
          Dashboard para Nadadores - Time4Swim
        </h1>
        <p className="text-gray-700">Bienvenido al panel de nadadores. Consulta tus entrenamientos y competencias.</p>
      </div>
    </div>
  );
}
