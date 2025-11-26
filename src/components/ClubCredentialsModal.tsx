"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Copy, User, Key, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Club {
  id: string;
  name: string;
  email?: string;
}

interface ClubCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Nuevo callback
  club: Club | null;
}

interface CreatedCredentials {
  email: string;
  password: string;
  success: boolean;
}

export default function ClubCredentialsModal({ isOpen, onClose, onSuccess, club }: ClubCredentialsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'form' | 'result'>('form');
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  
  const [formData, setFormData] = useState({
    email: "@time4swim.com",
    password: ""
  });

  // Resetear el modal cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      // Pequeño delay para que la animación de cierre se vea bien
      const timer = setTimeout(() => {
        setMode('form');
        setCreatedCredentials(null);
        setFormData({ email: "@time4swim.com", password: "" });
        setShowPassword(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!club || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Email y contraseña son requeridos');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/clubs/${club.id}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Credenciales creadas exitosamente');
        
        // Cerrar el modal primero
        onClose();
        
        // Llamar callback de éxito para refrescar la lista
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 300);
      } else {
        toast.error(data.error || 'Error al crear credenciales');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleClose = () => {
    onClose();
  };

  if (!club) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">Credenciales de Acceso</DialogTitle>
              <p className="text-sm text-gray-500 font-normal">{club.name}</p>
            </div>
          </div>
        </DialogHeader>

        {mode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 mb-2">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Email de Acceso
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@time4swim.com"
                    required
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Este será el usuario de acceso al sistema</p>
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 mb-2">
                  <Key className="h-3.5 w-3.5 text-blue-500" />
                  Contraseña
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, segura y fácil de recordar</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 pt-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <div className="p-1.5 bg-green-600 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  Credenciales Creadas Exitosamente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <User className="h-3.5 w-3.5 text-green-600" />
                    Email de Acceso
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={createdCredentials?.email || ""} 
                      readOnly 
                      className="bg-white border-green-200 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials?.email || "", "Email")}
                      className="shrink-0 border-green-300 hover:bg-green-50"
                      title="Copiar email"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Key className="h-3.5 w-3.5 text-green-600" />
                    Contraseña
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={createdCredentials?.password || ""} 
                      readOnly 
                      className="bg-white border-green-200 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 border-green-300 hover:bg-green-50"
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials?.password || "", "Contraseña")}
                      className="shrink-0 border-green-300 hover:bg-green-50"
                      title="Copiar contraseña"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="p-1.5 bg-amber-500 rounded-lg">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-amber-900 font-medium mb-1">
                    Importante: Guarda estas credenciales
                  </p>
                  <p className="text-xs text-amber-800">
                    El club podrá usar estos datos para acceder a su panel de administración. 
                    No se mostrarán nuevamente.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                onClick={handleClose}
                className="min-w-[100px] bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}