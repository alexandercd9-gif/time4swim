"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Phone, Mail, Globe, MapPin, Key } from "lucide-react";
import { toast } from "react-hot-toast";
import ClubCredentialsModal from "@/components/ClubCredentialsModal";

interface Club {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasCredentials?: boolean; // Nuevo campo para tracking
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: ""
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        
        // Verificar estado de credenciales para cada club
        const clubsWithStatus = await Promise.all(
          data.map(async (club: Club) => {
            try {
              const statusResponse = await fetch(`/api/admin/clubs/${club.id}/credentials/status`);
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                return { ...club, hasCredentials: statusData.hasCredentials };
              }
              return { ...club, hasCredentials: false };
            } catch (error) {
              console.error(`Error checking credentials for club ${club.id}:`, error);
              return { ...club, hasCredentials: false };
            }
          })
        );
        
        setClubs(clubsWithStatus);
      } else {
        toast.error('Error al cargar clubes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar clubes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre del club es requerido');
      return;
    }

    try {
      const url = editingClub ? `/api/clubs/${editingClub.id}` : '/api/clubs';
      const method = editingClub ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingClub ? 'Club actualizado exitosamente' : 'Club creado exitosamente');
        setIsDialogOpen(false);
        resetForm();
        fetchClubs();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar club');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar club');
    }
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      address: club.address || "",
      phone: club.phone || "",
      email: club.email || "",
      website: club.website || "",
      description: club.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleCredentials = (club: Club) => {
    setSelectedClub(club);
    setIsCredentialsDialogOpen(true);
  };

  const handleCredentialsSuccess = () => {
    // Refrescar la lista de clubes para actualizar el estado de credenciales
    fetchClubs();
  };

  const resetForm = () => {
    setEditingClub(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      description: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Clubes</h1>
        </div>
        <div className="text-center py-8">
          <p>Cargando clubes...</p>
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
            <Building2 className="h-8 w-8 text-blue-600" />
            Gestión de Clubes
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra los clubes de natación del sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Club
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClub ? 'Editar Club' : 'Crear Nuevo Club'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Club *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Club Natación Metropolitano"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej: +1 555-0123"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contacto@club.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.club.com"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del club..."
                  rows={3}
                />
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
                  {editingClub ? 'Actualizar' : 'Crear'} Club
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Clubes */}
      {clubs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No hay clubes registrados</p>
            <p className="text-sm text-muted-foreground">Crea el primer club para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Card key={club.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {club.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCredentials(club)}
                      className={`h-8 w-8 p-0 ${
                        club.hasCredentials 
                          ? 'text-white bg-green-600 hover:bg-green-700' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                      title={
                        club.hasCredentials 
                          ? 'Credenciales ya creadas - Click para ver/editar' 
                          : 'Crear Credenciales'
                      }
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(club)}
                      className="h-8 w-8 p-0"
                      title="Editar Club"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {club.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {club.address}
                  </div>
                )}
                
                {club.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {club.phone}
                  </div>
                )}
                
                {club.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {club.email}
                  </div>
                )}
                
                {club.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={club.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {club.website}
                    </a>
                  </div>
                )}
                
                {club.description && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {club.description}
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Creado: {formatDate(club.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Credenciales */}
      <ClubCredentialsModal
        isOpen={isCredentialsDialogOpen}
        onClose={() => setIsCredentialsDialogOpen(false)}
        onSuccess={handleCredentialsSuccess}
        club={selectedClub}
      />
    </div>
  );
}