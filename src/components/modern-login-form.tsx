"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { showTrialSuccessNotification } from "./TrialNotification";

export function ModernLoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔴 handleSubmit EJECUTADO');
    e.preventDefault();
    setLoading(true);
    console.log('Email value:', email);

    try {
      if (isLogin) {
        // Login
        console.log('🟡 ANTES del fetch', email);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password
          })
        });
        console.log('🟢 RESPONSE recibida', response);

        if (response.ok) {
          window.location.href = '/'; // El middleware redirigirá automáticamente según el rol
        } else {
          const error = await response.json();
          alert(error.message || 'Error al iniciar sesión');
        }
      } else {
        // Registro
        if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
        }
        console.log('🟡 ANTES del fetch registro', email);
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password
          })
        });
        console.log('🟢 RESPONSE recibida registro', response);

        if (response.ok) {
          const result = await response.json();
          // Mostrar notificación moderna de éxito
          showTrialSuccessNotification({
            email,
            trialDays: 7
          });
          // Cambiar a modo login después de un breve delay
          setTimeout(() => {
            setIsLogin(true);
            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
          }, 1500);
        } else {
          const error = await response.json();
          alert(error.message || 'Error al registrar usuario');
        }
      }
    } catch (error) {
      console.log('🔴 ERROR en fetch', error);
      console.error('Error detallado:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error de conexión detallado: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de prueba manual para depuración */}
      <div className="mb-4">
        <button 
          type="button" 
          style={{padding: '8px 16px', background: '#e0e7ff', color: '#1e40af', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #1e40af'}}
          onClick={() => {
            console.log('🔵 Prueba manual');
            fetch('/api/auth/login', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({email: 'admin@time4swim.com', password: 'admin123'})
            })
              .then(r => console.log('🟢 Prueba manual response:', r))
              .catch(e => console.log('🔴 Prueba manual error:', e));
          }}
        >
          PRUEBA MANUAL API
        </button>
      </div>
      {/* Formulario principal */}
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? "¡Bienvenido!" : "Crear cuenta"}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? "Ingresa a tu cuenta para continuar" 
                : "Únete a la comunidad de nadadores"
              }
            </p>
            
            {/* Banner trial para registro */}
            {!isLogin && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mt-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold">¡7 Días de Prueba GRATIS!</span>
                </div>
                <p className="text-sm text-blue-100">
                  Explora todas las funciones sin restricciones
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre completo solo en registro */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirmar contraseña solo en registro */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Botón submit con onClick adicional */}
            <button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Iniciar Sesión
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 mr-2" />
                      Crear Cuenta
                    </>
                  )}
                </>
              )}
              {loading && "Procesando..."}
            </button>
          </form>

          {/* Toggle entre login y registro */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              <Button
                type="button"
                variant="link"
                className="ml-1 text-blue-600 hover:text-blue-700 font-semibold p-0"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
              >
                {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botón de demo */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            {/* Lado izquierdo - Icono y texto */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg">
                <Timer className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-900">
                  Demo Cronómetro
                </h3>
                <p className="text-blue-700 text-sm">
                  Cronómetro sin registro
                </p>
              </div>
            </div>
            
            {/* Lado derecho - Botón */}
            <Link href="/demo">
              <Button 
                variant="outline" 
                size="default" 
                className="border-2 border-cyan-500 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white hover:border-transparent font-semibold shadow-md hover:shadow-lg transition-all duration-200 px-6"
              >
                Probar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}