"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Phone, Mail, Globe, MapPin, Key } from "lucide-react";
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
  hasCredentials?: boolean;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [onlyWithLicense, setOnlyWithLicense] = useState(false);
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
      const response = await fetch('/api/clubs', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Consultar estado de credenciales por club
        const withStatus = await Promise.all(
          data.map(async (club: Club) => {
            try {
              const statusRes = await fetch(`/api/admin/clubs/${club.id}/credentials/status`, { credentials: 'include' });
              if (statusRes.ok) {
                const status = await statusRes.json();
                return { ...club, hasCredentials: !!status.hasCredentials } as Club;
              }
            } catch (e) {
              console.error('Status check failed for club', club.id, e);
            }
            return { ...club, hasCredentials: false } as Club;
          })
        );
        setClubs(withStatus);
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
    // Refrescar para que el icono cambie de color
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
      <div className="flex justify-between items-start gap-6">
        {/* Título y leyenda */}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Gestión de Clubes
          </h1>
          <p className="text-gray-600 mt-2">Administra los clubes de natación del sistema</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2" title="Este club ya tiene credenciales y puede acceder">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-green-600 text-white">
                <Key className="h-3 w-3" />
              </span>
              Con acceso
            </div>
            <div className="flex items-center gap-2" title="Este club aún no tiene credenciales">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-200 text-gray-600">
                <Key className="h-3 w-3" />
              </span>
              Sin acceso
            </div>
          </div>
        </div>

        {/* Acciones: Filtro y Crear */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={onlyWithLicense}
              onChange={(e) => setOnlyWithLicense(e.target.checked)}
              className="h-4 w-4"
            />
            Solo con licencia
          </label>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Nuevo Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingClub ? 'Editar Club' : 'Crear Nuevo Club'}</DialogTitle>
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingClub ? 'Actualizar' : 'Crear'} Club
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Clubes */}
      {(onlyWithLicense ? clubs.filter(c => c.hasCredentials) : clubs).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No hay clubes registrados</p>
            <p className="text-sm text-gray-400">Crea el primer club para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(onlyWithLicense ? clubs.filter(c => c.hasCredentials) : clubs).map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {club.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={club.hasCredentials ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleCredentials(club)}
                      className={`h-8 w-8 p-0 ${club.hasCredentials ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                      title={club.hasCredentials ? 'Con acceso (credenciales creadas)' : 'Sin acceso: crear credenciales'}
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {club.address}
                  </div>
                )}
                
                {club.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {club.phone}
                  </div>
                )}
                
                {club.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {club.email}
                  </div>
                )}
                
                {club.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600 mt-3">
                    {club.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-400 pt-2 border-t">
                  Creado: {formatDate(club.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para crear credenciales */}
      <ClubCredentialsModal
        isOpen={isCredentialsDialogOpen}
        onClose={() => setIsCredentialsDialogOpen(false)}
        onSuccess={handleCredentialsSuccess}
        club={selectedClub}
      />
    </div>
  );
}
