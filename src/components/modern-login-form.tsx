'use client'

import { useState, useEffect } from 'react';
import { Key, Apple } from 'lucide-react';

export default function ModernLoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Detect simple phone vs email for inputmode/autocomplete
  const isPhone = (v: string) => /^\+?\d[\d\s\-()]{4,}$/.test(v);

  useEffect(() => {
    setMessage(null);
  }, [identifier]);

  const onContinuePasskey = async () => {
    setLoading(true);
    setMessage(null);
    // Placeholder: trigger WebAuthn flow on real integration
    console.log('Passkey flow - identifier:', identifier);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setMessage('Si tu dispositivo soporta Passkeys aparecerá el prompt. (Demo)');
  };

  const onSocial = (provider: string) => {
    setMessage(`Inicio con ${provider} (demo)`);
  };

  const onFallback = () => {
    setMessage('Mostrando opciones: contraseña o código OTP (demo)');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 12c2-3 6-6 10-6s8 3 10 6v6H3v-6z" fill="white" opacity="0.12" />
              <path d="M7 12c1.5-1 3-2 5-2s3.5 1 5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">Time4Swim</div>
            <div className="text-xs text-slate-600">Gestión profesional de natación</div>
          </div>
        </div>

        {/* Main single-field input */}
        <label className="block text-xs text-slate-600 mb-2">Correo o teléfono</label>
        <div className="flex items-center gap-3 mb-4">
          <input
            className="flex-1 bg-white/80 placeholder-slate-500 rounded-lg px-4 py-3 border border-white/40 focus:border-cyan-400 outline-none transition-all shadow-sm"
            placeholder="ej. juan@club.com o +34123456789"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            inputMode={isPhone(identifier) ? 'tel' : 'email'}
            autoComplete="email"
          />
        </div>

        {/* Primary Passkey CTA */}
        <button
          onClick={onContinuePasskey}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold shadow-md hover:scale-[0.997] active:scale-95 transition-transform"
          disabled={loading}
        >
          <Key className="h-5 w-5 text-white" />
          {loading ? 'Abriendo Passkey…' : 'Continuar con Passkey'}
        </button>

        {/* Social buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => onSocial('Google')}
            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/40 bg-white/70 hover:bg-white/80 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285f4" d="M533.5 278.4c0-17.7-1.6-35.6-4.8-52.6H272v99.6h147.4c-6.3 34-25 62.8-53.4 82v68.1h86.3c50.5-46.6 80.2-115 80.2-197.1z"/>
              <path fill="#34a853" d="M272 544.3c72.9 0 134.2-24.2 178.9-65.7l-86.3-68.1c-24.1 16.2-55 25.8-92.6 25.8-71 0-131.2-47.9-152.7-112.1H28.6v70.6C72.9 493 166.2 544.3 272 544.3z"/>
              <path fill="#fbbc04" d="M119.3 324.3c-10.9-32.1-10.9-66.6 0-98.7V155H28.6c-39.8 79.6-39.8 174.5 0 254.1l90.7-84.8z"/>
              <path fill="#ea4335" d="M272 107.7c38.6 0 73.4 13.3 100.8 39L458 83.9C411 41 345 16 272 16 166.2 16 72.9 67.3 28.6 155l90.7 70.3C140.8 155.6 201 107.7 272 107.7z"/>
            </svg>
            <span className="text-sm">Continuar con Google</span>
          </button>

          <button
            onClick={() => onSocial('Apple')}
            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/40 bg-white/5 hover:bg-white/10 transition text-white"
          >
            <Apple className="h-4 w-4" />
            <span className="text-sm">Continuar con Apple</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <button onClick={onFallback} className="underline">Usar contraseña o código OTP</button>
          <a href="/terms" className="text-xs text-slate-500">Términos</a>
        </div>

        {message && <div className="mt-3 text-sm text-slate-700">{message}</div>}

        <div className="mt-6 text-center text-xs text-slate-500">
          Al continuar aceptas los <a href="/terms" className="underline text-slate-600">Términos</a> y la <a href="/privacy" className="underline text-slate-600">Política de Privacidad</a>.
        </div>

        <div className="mt-4 text-center">
          <a href="/register" className="text-sm font-medium text-slate-900 underline">¿No tienes cuenta? Regístrate</a>
        </div>
      </div>
    </div>
  );
}