'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, Sparkles, Mail } from 'lucide-react';

interface TrialSuccessNotificationProps {
  email: string;
  trialDays: number;
}

export const showTrialSuccessNotification = ({ email, trialDays }: TrialSuccessNotificationProps) => {
  toast.custom(
    (t) => (
      <div
        className={`
          ${t.visible ? 'animate-enter' : 'animate-leave'}
          max-w-md w-full bg-gradient-to-r from-green-500 to-emerald-600 
          shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5
          transform transition-all duration-500 ease-out
        `}
      >
        <div className="flex-1 w-0 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <p className="text-lg font-bold text-white">
                  ¡Registro Exitoso!
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-200" />
                  <span className="font-medium">
                    {trialDays} días de prueba gratis
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100 truncate">
                    {email}
                  </span>
                </div>
                
                <p className="text-green-100 font-medium mt-3">
                  ¡Ya puedes iniciar sesión y explorar!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex border-l border-white border-opacity-20">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-white hover:bg-white hover:bg-opacity-10 focus:outline-none transition-colors"
          >
            <span className="text-sm font-medium">Cerrar</span>
          </button>
        </div>
        
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  );
};

// Hook para usar fácilmente en componentes
export const useTrialNotification = () => {
  return {
    showSuccess: showTrialSuccessNotification,
  };
};