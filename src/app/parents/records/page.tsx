"use client";

import TrainingChart from "@/components/TrainingChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function RecordsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Records & Progreso
          </h1>
          <p className="text-gray-600">Visualiza el progreso de tus nadadores a lo largo del tiempo</p>
        </div>

        {/* Gráfico de Progreso */}
        <TrainingChart />
      </div>
    </div>
  );
}
