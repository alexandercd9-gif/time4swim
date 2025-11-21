'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface NovedadesButtonProps {
  hasUnreadNews?: boolean;
  onClick: () => void;
}

export default function NovedadesButton({ hasUnreadNews = true, onClick }: NovedadesButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={hasUnreadNews ? "Tienes novedades nuevas" : "Ver novedades"}
    >
      {/* Ícono de novedades */}
      <Sparkles className="h-5 w-5" />
      
      {/* Badge rojo cuando hay novedades sin leer */}
      {hasUnreadNews && (
        <span className="absolute top-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
