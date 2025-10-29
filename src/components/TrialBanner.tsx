'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Star, AlertTriangle } from 'lucide-react';

interface TrialBannerProps {
  user: {
    id: string;
    accountStatus?: string;
    isTrialAccount?: boolean;
    trialExpiresAt?: string | null;
  };
}

const TrialBanner: React.FC<TrialBannerProps> = ({ user }) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user.isTrialAccount || !user.trialExpiresAt) return;

    const calculateDaysLeft = () => {
      const now = new Date();
      const expiry = new Date(user.trialExpiresAt!);
      const diffTime = expiry.getTime() - now.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [user.trialExpiresAt, user.isTrialAccount]);

  // No mostrar si no es trial, ya fue descartado, o no hay días calculados
  if (!user.isTrialAccount || dismissed || daysLeft === null) {
    return null;
  }

  // Determinar el estilo según los días restantes
  const getBannerStyle = () => {
    if (daysLeft <= 0) {
      return {
        bg: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: AlertTriangle,
        text: 'text-white',
        message: '⚠️ Tu cuenta trial ha expirado',
        description: 'Contacta al administrador para continuar usando la plataforma'
      };
    } else if (daysLeft === 1) {
      return {
        bg: 'bg-gradient-to-r from-orange-500 to-red-500',
        icon: AlertTriangle,
        text: 'text-white',
        message: `🚨 ¡Solo queda ${daysLeft} día de trial!`,
        description: 'Tu acceso terminará mañana. Contacta al administrador.'
      };
    } else if (daysLeft <= 3) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: Clock,
        text: 'text-white',
        message: `⏰ ${daysLeft} días restantes de trial`,
        description: 'Tu periodo de prueba termina pronto. Planifica tu siguiente paso.'
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-purple-600',
        icon: Star,
        text: 'text-white',
        message: `✨ ${daysLeft} días restantes de trial`,
        description: 'Estás explorando Time4Swim. ¡Esperamos que te guste!'
      };
    }
  };

  const style = getBannerStyle();
  const IconComponent = style.icon;

  return (
    <div className={`${style.bg} ${style.text} p-4 rounded-lg shadow-lg mb-6 relative overflow-hidden`}>
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-white bg-opacity-5 pattern-dots"></div>
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {style.message}
            </h3>
            <p className="text-sm opacity-90 mb-3">
              {style.description}
            </p>
            
            {/* Barra de progreso visual */}
            <div className="bg-white bg-opacity-20 rounded-full h-2 mb-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (daysLeft / 7) * 100))}%` 
                }}
              ></div>
            </div>
            
            <div className="text-xs opacity-75">
              {user.trialExpiresAt && (
                <>
                  Expira el: {new Date(user.trialExpiresAt).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Botón para cerrar */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          title="Cerrar notificación"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 -top-2 -bottom-2">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
      </div>
    </div>
  );
};

export default TrialBanner;