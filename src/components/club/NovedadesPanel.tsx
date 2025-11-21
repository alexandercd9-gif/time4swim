'use client';

import { X, Sparkles, Gift, TrendingUp, Users, FileText, Palette } from 'lucide-react';
import { useState } from 'react';

interface NovedadesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateTrial: () => void;
  clubName?: string;
}

export default function NovedadesPanel({ 
  isOpen, 
  onClose, 
  onActivateTrial,
  clubName = "tu club"
}: NovedadesPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel lateral */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header del panel */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Novedades</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Banner principal */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-6 mb-6 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-6 w-6 text-white" />
                  <span className="text-white/90 text-sm font-medium">¡NUEVO!</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">
                  CLUB PRO ya está disponible
                </h3>
                
                <p className="text-blue-100 text-sm mb-4">
                  Lleva {clubName} al siguiente nivel con funciones profesionales
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <p className="text-white text-xs font-medium mb-1">🎁 Oferta especial</p>
                  <p className="text-white text-lg font-bold">30 días GRATIS</p>
                  <p className="text-blue-100 text-xs">Sin tarjeta • Sin compromiso</p>
                </div>
              </div>
            </div>

            {/* Features del plan PRO */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Lo que obtienes con CLUB PRO:
              </h4>
              
              <FeatureItem
                icon={<FileText className="h-5 w-5 text-blue-600" />}
                title="Reportes personalizados"
                description="Exporta reportes PDF con el logo y colores de tu club"
              />
              
              <FeatureItem
                icon={<Users className="h-5 w-5 text-cyan-600" />}
                title="Sistema de asistencias"
                description="Control digital de asistencias con notificaciones automáticas"
              />
              
              <FeatureItem
                icon={<Palette className="h-5 w-5 text-purple-600" />}
                title="Marca personalizada"
                description="Logo del club, colores personalizados y URL propia"
              />
              
              <FeatureItem
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                title="Integración FDPN masiva"
                description="Sincronización automática de todos tus nadadores"
              />
              
              <FeatureItem
                icon={<Sparkles className="h-5 w-5 text-yellow-600" />}
                title="Y mucho más..."
                description="Profesores ilimitados, estadísticas avanzadas, soporte prioritario"
              />
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onActivateTrial();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Gift className="h-5 w-5" />
                Activar 30 días GRATIS
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Tal vez después
              </button>
            </div>

            {/* Info adicional */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-gray-600 text-center">
                💳 No necesitas tarjeta para el trial<br />
                🔄 Cancela cuando quieras<br />
                💾 Tus datos se guardan siempre
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente auxiliar para los features
function FeatureItem({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
