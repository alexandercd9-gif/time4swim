"use client";

import { useState } from "react";
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
    email: "",
    password: ""
  });

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
        setCreatedCredentials({
          email: formData.email,
          password: formData.password,
          success: true
        });
        setMode('result');
        toast.success('Credenciales creadas exitosamente');
        
        // Llamar callback de éxito si existe
        if (onSuccess) {
          onSuccess();
        }
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

  const resetModal = () => {
    setMode('form');
    setCreatedCredentials(null);
    setFormData({ email: "", password: "" });
    setShowPassword(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!club) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Credenciales de Acceso - {club.name}
          </DialogTitle>
        </DialogHeader>

        {mode === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email de Acceso</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="club@time4swim.com"
                    required
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Contraseña segura"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
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
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Credenciales Creadas Exitosamente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Email de Acceso</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={createdCredentials?.email || ""} 
                      readOnly 
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials?.email || "", "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contraseña</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={createdCredentials?.password || ""} 
                      readOnly 
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials?.password || "", "Contraseña")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Guarda estas credenciales en un lugar seguro. 
                El club podrá usar estos datos para acceder a su panel de administración.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}