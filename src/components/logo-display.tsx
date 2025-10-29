"use client";

import { useState } from "react";

interface LogoDisplayProps {
  variant?: "default" | "sidebar";
}

export function LogoDisplay({ variant = "default" }: LogoDisplayProps) {
  const [imageError, setImageError] = useState(false);

  if (variant === "sidebar") {
    return (
      <div className="flex justify-center items-center">
        {!imageError ? (
          <img 
            src="/logo.png" 
            alt="Time4Swim Logo" 
            className="max-w-[260px] max-h-[120px] w-auto h-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Fallback text logo for sidebar */
          <div className="text-center">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-700">
              Time4Swim
            </div>
            <div className="text-cyan-600 font-medium text-sm">
              Sistema de Natación
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mb-8 min-h-[300px]">
      {!imageError ? (
        <img 
          src="/logo.png" 
          alt="Time4Swim Logo" 
          className="max-w-[800px] max-h-[300px] w-auto h-auto object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Fallback text logo */
        <div className="text-center">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-700 py-2">
            Time4Swim
          </div>
          <div className="text-cyan-600 font-medium text-xl mt-2">
            Sistema de Gestión de Natación
          </div>
        </div>
      )}
    </div>
  );
}