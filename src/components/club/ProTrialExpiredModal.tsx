"use client";

import { useState } from "react";
import { X, Crown, Check, Sparkles, TrendingUp, Users, Palette, BarChart3 } from "lucide-react";

interface ProTrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  daysExpired?: number;
}

export default function ProTrialExpiredModal({ 
  isOpen, 
  onClose, 
  onUpgrade,
  daysExpired = 0
}: ProTrialExpiredModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleUpgradeClick = () => {
    window.location.href = '/subscription?type=club&plan=club_pro';
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const proFeatures = [
    {
      icon: BarChart3,
      title: "Reportes Avanzados",
      description: "PDFs profesionales de progreso y estadísticas"
    },
    {
      icon: Users,
      title: "Control de Asistencias",
      description: "Registro digital y reportes de asistencia"
    },
    {
      icon: Palette,
      title: "Personalización Total",
      description: "Logo, colores y dominio personalizado"
    },
    {
      icon: TrendingUp,
      title: "Integración FDPN",
      description: "Sincronización masiva con federación"
    },
    {
      icon: Sparkles,
      title: "Análisis de Rendimiento",
      description: "Estadísticas avanzadas y comparativas"
    }
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8 rounded-t-2xl">
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Icono central */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Crown className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Tu Periodo de Prueba PRO ha Terminado
          </h2>
          <p className="text-white/90 text-center text-lg">
            {daysExpired > 0 
              ? `Expiró hace ${daysExpired} ${daysExpired === 1 ? 'día' : 'días'}`
              : 'Tu trial PRO de 30 días ha finalizado'
            }
          </p>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {/* Mensaje principal */}
          <div className="text-center mb-8">
            <p className="text-gray-700 text-lg mb-2">
              ¡Gracias por probar <span className="font-semibold">Club PRO</span>! 
            </p>
            <p className="text-gray-600">
              Has vuelto al <span className="font-semibold">Plan FREE</span>. 
              Actualiza ahora para recuperar todas las funciones profesionales.
            </p>
          </div>

          {/* Lista de beneficios */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Con Club PRO tendrás:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Icon className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing destacado */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6" />
              <h3 className="text-2xl font-bold">Club PRO</h3>
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <span className="text-5xl font-bold">S/. 99</span>
              <span className="text-white/80 text-xl">/mes</span>
            </div>
            <p className="text-white/90 text-sm">
              Todas las funciones profesionales incluidas
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgradeClick}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5" />
                Actualizar a PRO Ahora
              </span>
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continuar con Plan FREE
            </button>
          </div>

          {/* Nota sobre Plan FREE */}
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 El Plan FREE sigue siendo completamente funcional para nadadores ilimitados y hasta 6 profesores
          </p>
        </div>
      </div>
    </div>
  );
}
