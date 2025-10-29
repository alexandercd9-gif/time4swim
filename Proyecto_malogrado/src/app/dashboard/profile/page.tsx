"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Calendar,
  Trophy,
  Users,
  Timer,
  Key,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    children: number;
  };
}

interface ProfileStats {
  totalChildren: number;
  totalTrainings: number;
  totalRecords: number;
  joinedDaysAgo: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [infoForm, setInfoForm] = useState({
    name: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchUserProfile();
    fetchProfileStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setInfoForm({
          name: userData.name,
          email: userData.email
        });
      } else {
        toast.error('Error al cargar el perfil');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const response = await fetch('/api/profile/stats');
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const loadingToast = toast.loading('Actualizando información...');
    
    try {
      const response = await fetch('/api/profile/update-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(infoForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditingInfo(false);
        toast.dismiss(loadingToast);
        toast.success('¡Información actualizada exitosamente! ✅');
        fetchUserProfile(); // Refrescar datos
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al actualizar información');
      }
    } catch (error) {
      console.error('Error updating info:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    const loadingToast = toast.loading('Cambiando contraseña...');
    
    try {
      const response = await fetch('/api/profile/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setEditingPassword(false);
        toast.dismiss(loadingToast);
        toast.success('¡Contraseña actualizada exitosamente! 🔐');
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.dismiss(loadingToast);
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error al cargar el perfil</div>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt);
  const daysAgo = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración</p>
        </div>
        {/* Avatar del perfil oculto */}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mis Hijos</p>
              <p className="text-2xl font-bold text-gray-900">{user._count?.children || 0}</p>
            </div>
            <Users className="h-8 w-8 text-cyan-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTrainings || 0}</p>
            </div>
            <Timer className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Récords</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalRecords || 0}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Días en Time4Swim</p>
              <p className="text-2xl font-bold text-gray-900">{daysAgo}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Información Personal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Información Personal</h3>
          {!editingInfo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingInfo(true)}
              className="text-blue-600"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingInfo(false);
                  setInfoForm({ name: user.name, email: user.email });
                }}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {!editingInfo ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre Completo</p>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Miembro desde</p>
                <p className="text-lg text-gray-900">
                  {joinedDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </form>
        )}
      </Card>

      {/* Cambiar Contraseña */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Seguridad</h3>
            <p className="text-sm text-gray-600">Cambia tu contraseña para mantener tu cuenta segura</p>
          </div>
          {!editingPassword ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPassword(true)}
              className="text-blue-600"
            >
              <Key className="w-4 h-4 mr-2" />
              Cambiar Contraseña
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingPassword(false);
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>

        {editingPassword && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Key className="w-4 h-4 mr-2" />
              Actualizar Contraseña
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}