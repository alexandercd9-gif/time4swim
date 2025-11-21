"use client";

import { useEffect, useState } from "react";
import { Sparkles, Crown, X } from "lucide-react";

interface ProTrialBannerProps {
  trialExpiresAt?: Date | string | null;
  isProTrial?: boolean;
  isProActive?: boolean;
}

export default function ProTrialBanner({ 
  trialExpiresAt, 
  isProTrial = false,
  isProActive = false 
}: ProTrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (trialExpiresAt) {
      const expiresDate = new Date(trialExpiresAt);
      const now = new Date();
      const diffTime = expiresDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    }
  }, [trialExpiresAt]);

  if (!showBanner) return null;

  // Banner para PRO TRIAL activo
  if (isProTrial && daysLeft > 0) {
    return (
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <div>
            <div className="font-bold text-sm">
              ✨ CLUB PRO TRIAL ACTIVO
            </div>
            <div className="text-xs opacity-90">
              {daysLeft} {daysLeft === 1 ? 'día restante' : 'días restantes'} • 
              Todas las funciones PRO habilitadas
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-white/80 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Banner para PRO ACTIVO (pagado)
  if (isProActive) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5" />
          <div>
            <div className="font-bold text-sm">
              👑 CLUB PRO ACTIVO
            </div>
            <div className="text-xs opacity-90">
              Suscripción activa • Todas las funciones desbloqueadas
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-white/80 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Banner para plan FREE
  return (
    <div className="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <div>
          <div className="font-semibold text-sm">
            Plan FREE
          </div>
          <div className="text-xs text-gray-500">
            Funcionalidades básicas • Actualiza a PRO para más funciones
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowBanner(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
