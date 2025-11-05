"use client";

import TrainingChart from "@/components/TrainingChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function RecordsPage() {
  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Records & Progreso</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-0.5 lg:mt-1">Visualiza el progreso de tus nadadores a lo largo del tiempo</p>
          </div>
        </div>

        {/* Gráfico de Progreso */}
        <TrainingChart />
      </div>
    </div>
  );
}
