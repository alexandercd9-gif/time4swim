"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Building2, Shield, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface Club {
  id: string;
  name: string;
}

interface ClubUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  clubs: {
    club: {
      id: string;
      name: string;
    };
    isActive: boolean;
  }[];
}

export default function ClubUsersPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubUsers, setClubUsers] = useState<ClubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    clubId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Cargar clubes
      const clubsResponse = await fetch('/api/clubs');
      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        setClubs(clubsData);
      }

      // Cargar usuarios de club
      const usersResponse = await fetch('/api/admin/club-users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setClubUsers(usersData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.clubId) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    try {
      const response = await fetch('/api/admin/club-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Usuario de club creado exitosamente');
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear usuario');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      clubId: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CLUB':
        return 'Administrador de Club';
      case 'TEACHER':
        return 'Profesor';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Usuarios de Club</h1>
        </div>
        <div className="text-center py-8">
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-green-600" />
            Usuarios de Club
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra los usuarios que gestionan clubes de natación
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario Club
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Usuario de Club</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@club.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña temporal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="club">Club *</Label>
                <Select value={formData.clubId} onValueChange={(value) => setFormData({ ...formData, clubId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Usuario
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Usuarios */}
      {clubUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No hay usuarios de club registrados</p>
            <p className="text-sm text-muted-foreground">Crea el primer usuario para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clubUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {user.role === 'CLUB' ? (
                      <Shield className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    )}
                    {user.name}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'CLUB' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getRoleLabel(user.role)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>📧</span>
                    <span>{user.email}</span>
                  </div>
                  
                  {user.clubs.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Clubes Asignados:</div>
                      {user.clubs.map((userClub, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
                          <Building2 className="h-4 w-4" />
                          <span>{userClub.club.name}</span>
                          {userClub.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Activo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Creado: {formatDate(user.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}