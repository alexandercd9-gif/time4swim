import { Stopwatch } from "@/components/stopwatch";

export default function TimerPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cronómetro</h1>
        <p className="text-gray-600">Registra entrenamientos y tiempos de natación</p>
      </div>

      {/* Cronómetro */}
      <div className="max-w-2xl mx-auto">
        <Stopwatch />
      </div>
    </div>
  );
}