"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { showTrialSuccessNotification } from "./TrialNotification";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const { refetchUser } = useUser();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          // Refrescar usuario sin recargar la página
          await refetchUser();
          window.location.href = '/';
        } else {
          const error = await response.json();
          alert(error.message || 'Error al iniciar sesión');
        }
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // Mostrar notificación moderna de éxito
          showTrialSuccessNotification({
            email: formData.email,
            trialDays: 7
          });
          
          // Cambiar a modo login después de un breve delay
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ name: "", email: "", password: "", confirmPassword: "" });
          }, 1500);
        } else {
          const error = await response.json();
          alert(error.message || 'Error al registrar usuario');
        }
      }
    } catch (error) {
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Login/Registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <LogIn className="h-6 w-6" />
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required={!isLogin}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Procesando..."
              ) : (
                <>
                  {isLogin ? <LogIn className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
              }}
            >
              {isLogin 
                ? "¿No tienes cuenta? Regístrate aquí" 
                : "¿Ya tienes cuenta? Inicia sesión aquí"
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Prueba */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Timer className="h-12 w-12 mx-auto text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              ¿Quieres probar el cronómetro?
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Prueba nuestro cronómetro sin registrarte (no podrás guardar entrenamientos)
            </p>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <Timer className="h-4 w-4 mr-2" />
                Probar Cronómetro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}