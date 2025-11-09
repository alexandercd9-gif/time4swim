"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Mail, Calendar, Shield, User, Lock, AlertCircle, UserPlus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface Coach {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  createdAt: string;
  clubs: {
    isActive: boolean;
  }[];
  _count: {
    coachingLanes: number;
  };
}

interface CoachCredentials {
  name: string;
  email: string;
  password: string;
}

export default function EntrenadoresPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<CoachCredentials | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      const response = await fetch("/api/club/info");
      if (response.ok) {
        const data = await response.json();
        if (data.club?.name) {
          // Convertir nombre del club a formato de dominio
          const domain = data.club.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/\s+/g, "") // Eliminar espacios
            .replace(/[^a-z0-9]/g, ""); // Solo letras y números
          setClubName(domain);
        }
      }
    } catch (error) {
      console.error("Error al cargar info del club:", error);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await fetch("/api/club/coaches/list");
      if (!response.ok) {
        throw new Error("Error al cargar entrenadores");
      }
      const data = await response.json();
      setCoaches(data.coaches || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar entrenadores");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const isEditing = !!editingCoach;
      const url = "/api/club/coaches";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? { ...formData, id: editingCoach.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error al ${isEditing ? 'actualizar' : 'crear'} entrenador`);
      }

      // Cerrar dialog de formulario
      setIsDialogOpen(false);
      
      // Solo mostrar credenciales si es un nuevo entrenador
      if (!isEditing) {
        setCredentials({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setShowCredentials(true);
      } else {
        toast.success('Entrenador actualizado exitosamente');
      }
      
      // Resetear formulario
      setFormData({ name: "", email: "", password: "", photo: "" });
      setPhotoPreview(null);
      setEditingCoach(null);
      
      // Refrescar lista
      fetchCoaches();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      email: coach.email,
      password: "", // No rellenar la contraseña al editar
      photo: coach.profilePhoto || "",
    });
    setPhotoPreview(coach.profilePhoto || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCoach(null);
    setFormData({ name: "", email: "", password: "", photo: "" });
    setPhotoPreview(null);
    setError("");
  };

  const handleCloseCredentials = () => {
    setShowCredentials(false);
    setCredentials(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pt-6 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Entrenadores
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los entrenadores de tu club
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Entrenador
          </Button>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingCoach ? (
                  <>
                    <Pencil className="h-5 w-5 text-blue-600" />
                    Editar Entrenador
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Nuevo Entrenador
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingCoach 
                  ? 'Actualiza la información del entrenador'
                  : 'Crea una cuenta para un nuevo entrenador del club'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Foto del entrenador */}
              <div className="space-y-1.5">
                <Label htmlFor="photo" className="text-sm font-medium">
                  Foto del entrenador (opcional)
                </Label>
                <div className="flex items-center gap-3">
                  {photoPreview ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setFormData({ ...formData, photo: "" });
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validar tamaño (máximo 2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('La imagen es muy grande. Máximo 2MB');
                            e.target.value = '';
                            return;
                          }

                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.onload = () => {
                              // Redimensionar imagen a máximo 300x300
                              const canvas = document.createElement('canvas');
                              const ctx = canvas.getContext('2d');
                              
                              let width = img.width;
                              let height = img.height;
                              const maxSize = 300;

                              if (width > height) {
                                if (width > maxSize) {
                                  height = (height * maxSize) / width;
                                  width = maxSize;
                                }
                              } else {
                                if (height > maxSize) {
                                  width = (width * maxSize) / height;
                                  height = maxSize;
                                }
                              }

                              canvas.width = width;
                              canvas.height = height;
                              ctx?.drawImage(img, 0, 0, width, height);

                              // Comprimir a JPEG con calidad 0.7
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                              setPhotoPreview(compressedBase64);
                              setFormData({ ...formData, photo: compressedBase64 });
                            };
                            img.src = reader.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="h-9 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG o GIF (máx. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Nombre completo */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Juan Pérez"
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="text"
                      value={formData.email.split('@')[0]}
                      onChange={(e) => {
                        const username = e.target.value.toLowerCase().replace(/\s+/g, '');
                        const domain = clubName || 'ejemplo';
                        setFormData({ ...formData, email: `${username}@${domain}.com` });
                      }}
                      placeholder="nombre.apellido"
                      className="pl-9 h-9 text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-center px-3 h-9 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 font-medium whitespace-nowrap">
                    @{clubName || 'ejemplo'}.com
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Usuario para iniciar sesión
                </p>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  {editingCoach ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={editingCoach ? "Dejar en blanco para mantener la actual" : "Mínimo 6 caracteres"}
                    className="pl-9 h-9 text-sm"
                    minLength={editingCoach ? 0 : 6}
                    required={!editingCoach}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {editingCoach 
                    ? 'Solo completa si deseas cambiar la contraseña'
                    : 'Guarda esta contraseña para el entrenador'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-900">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1 h-9 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-9 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editingCoach ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {editingCoach ? (
                        <>
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Actualizar
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          Crear
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de entrenadores */}
      {coaches.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay entrenadores
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando tu primer entrenador al club
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Entrenador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((coach) => (
            <Card key={coach.id} className="border-2 hover:border-blue-300 transition-colors">
              <CardContent className="p-5">
                <div className="space-y-3">
                  {/* Foto y nombre */}
                  <div className="flex items-start gap-3">
                    {coach.profilePhoto ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 shrink-0">
                        <img 
                          src={coach.profilePhoto} 
                          alt={coach.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 shrink-0">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                          {coach.name}
                        </h3>
                        <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-sm text-blue-600 font-medium">
                        Entrenador
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{coach.email}</span>
                  </div>

                  {/* Fecha de creación */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      Registrado {new Date(coach.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {/* Estadísticas */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Competencias asignadas:</span>
                      <span className="font-bold text-blue-600">
                        {coach._count.coachingLanes}
                      </span>
                    </div>
                  </div>

                  {/* Estado y acciones */}
                  <div className="pt-2 flex items-center justify-between">
                    {coach.clubs[0]?.isActive ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        Activo
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                        Inactivo
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coach)}
                      className="h-7 px-2.5 text-xs"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de credenciales */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-green-600" />
              Entrenador Creado
            </DialogTitle>
            <DialogDescription className="text-sm">
              Guarda estas credenciales y entrégaselas al entrenador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-3">
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Nombre:
              </label>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {credentials?.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Correo (usuario):
              </label>
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-mono text-sm text-blue-900">
                  {credentials?.email}
                </p>
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Contraseña:
              </label>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-mono text-sm text-amber-900">
                  {credentials?.password}
                </p>
              </div>
            </div>

            {/* Nota importante */}
            <div className="flex items-start gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-0.5">Importante:</p>
                <p>
                  Copia estas credenciales ahora. No podrás ver la contraseña nuevamente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              onClick={handleCloseCredentials}
              className="flex-1 h-9 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
