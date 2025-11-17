"use client";

import { useState, useEffect } from "react";
import BestTimesByStyle from "@/components/BestTimesByStyle";
import TrainingHistory from "@/components/TrainingHistory";
import { TrendingUp, Calendar } from "lucide-react";

export default function BestHistorySwitcher() {
  const [view, setView] = useState<'best' | 'history'>('best');
  const [isAnimating, setIsAnimating] = useState(false);

  // Recuperar vista guardada del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trainingView');
    if (saved === 'best' || saved === 'history') {
      setView(saved);
    }
  }, []);

  // Guardar vista seleccionada
  const handleViewChange = (newView: 'best' | 'history') => {
    if (newView === view) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setView(newView);
      localStorage.setItem('trainingView', newView);
      setTimeout(() => setIsAnimating(false), 50);
    }, 200);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs estilo pestañas */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          <button
            onClick={() => handleViewChange('best')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all relative ${
              view === 'best' 
                ? 'text-blue-600 bg-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-pressed={view === 'best'}
          >
            <span className="inline-flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mejores Tiempos
            </span>
            {view === 'best' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => handleViewChange('history')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all relative ${
              view === 'history' 
                ? 'text-purple-600 bg-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-pressed={view === 'history'}
          >
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Historial Diario
            </span>
            {view === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Contenido con animación de fade */}
      <div className="p-6 min-h-[400px]">
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {view === 'best' ? <BestTimesByStyle showExpandedView={true} /> : <TrainingHistory />}
        </div>
      </div>
    </div>
  );
}
