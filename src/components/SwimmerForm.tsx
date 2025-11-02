"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Upload, Link, X } from "lucide-react";

interface Club {
  id: string;
  name: string;
}

interface SwimmerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  swimmer?: {
    id: string;
    name: string;
    birthDate: string;
    gender: string;
    club?: {
      id: string;
      name: string;
    };
    coach?: string;
    photo?: string;
  } | null;
}

export default function SwimmerForm({ isOpen, onClose, onSuccess, swimmer }: SwimmerFormProps) {
  const [formData, setFormData] = useState({
    name: swimmer?.name || "",
    birthDate: swimmer?.birthDate ? swimmer.birthDate.split('T')[0] : "",
    gender: swimmer?.gender || "",
    clubId: swimmer?.club?.id || "",
    coach: swimmer?.coach || "",
    photo: swimmer?.photo || "",
    fdpnAffiliateCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(swimmer?.photo || null);
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url');

  // Cargar clubes cuando se abre el formulario
  useEffect(() => {
    if (isOpen) {
      fetchClubs();
    }
  }, [isOpen]);

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Error al cargar clubes:', error);
    }
  };

  // Función para comprimir imagen
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Función para manejar la selección de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen');
        return;
      }
      
      try {
        toast.loading('Procesando imagen...', { id: 'compressing' });
        
        // Comprimir imagen automáticamente
        const compressedImage = await compressImage(file);
        
        // Verificar tamaño después de compresión (base64 es ~33% más grande que original)
        const sizeInBytes = (compressedImage.length * 3) / 4;
        
        if (sizeInBytes > 3 * 1024 * 1024) { // 3MB después de compresión
          toast.error('La imagen es demasiado grande incluso después de comprimirla. Intenta con una imagen más pequeña.');
          toast.dismiss('compressing');
          return;
        }

        setPhotoFile(file);
        setPhotoPreview(compressedImage);
        
        toast.success('Imagen procesada correctamente', { id: 'compressing' });
        
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        toast.error('Error al procesar la imagen', { id: 'compressing' });
      }
    }
  };

  // Función para convertir archivo a base64 (ya no necesaria, usamos la imagen comprimida)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Función para limpiar la foto
  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({ ...formData, photo: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoData = formData.photo;

      // Si hay un archivo seleccionado, usar la imagen ya comprimida del preview
      if (photoFile && photoPreview) {
        photoData = photoPreview;
      }

      const submitData = {
        ...formData,
        photo: photoData
      };

      const url = swimmer 
        ? `/api/swimmers/${swimmer.id}` 
        : '/api/swimmers';
      
      const method = swimmer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(swimmer ? 'Nadador actualizado exitosamente' : 'Nadador creado exitosamente');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          birthDate: "",
          gender: "",
          clubId: "",
          coach: "",
          photo: "",
          fdpnAffiliateCode: ""
        });
        clearPhoto();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setFormData({
      name: swimmer?.name || "",
      birthDate: swimmer?.birthDate ? swimmer.birthDate.split('T')[0] : "",
      gender: swimmer?.gender || "",
      clubId: swimmer?.club?.id || "",
      coach: swimmer?.coach || "",
      photo: swimmer?.photo || "",
      fdpnAffiliateCode: ""
    });
    setPhotoFile(null);
    setPhotoPreview(swimmer?.photo || null);
    setPhotoMode('url');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-bold">
            {swimmer ? '✏️ Editar Nadador' : '➕ Crear Nuevo Nadador'}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {swimmer ? 'Actualiza la información del nadador' : 'Completa los datos para registrar un nuevo nadador'}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Información Personal
            </h3>
            
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Juan Pérez García"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>

            {/* Fecha y Género en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Género */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Género <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">👦 Masculino</SelectItem>
                    <SelectItem value="FEMALE">👧 Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información del Club */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Información del Club
            </h3>

            {/* Club y Entrenador en grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Club */}
              <div className="space-y-2">
                <Label htmlFor="clubId" className="text-sm font-medium">Club</Label>
                <Select
                  value={formData.clubId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, clubId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin club asignado</SelectItem>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entrenador */}
              <div className="space-y-2">
                <Label htmlFor="coach" className="text-sm font-medium">Entrenador</Label>
                <Input
                  id="coach"
                  type="text"
                  placeholder="Nombre del entrenador"
                  value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Código FDPN */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Información Adicional
            </h3>

            <div className="space-y-2">
              <Label htmlFor="fdpnAffiliateCode" className="text-sm font-medium">
                Código de Afiliado FDPN
              </Label>
              <Input
                id="fdpnAffiliateCode"
                type="text"
                placeholder="Ej: 79272554"
                value={formData.fdpnAffiliateCode}
                onChange={(e) => setFormData({ ...formData, fdpnAffiliateCode: e.target.value })}
                className="font-mono h-11"
              />
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <span className="text-blue-500">ℹ️</span>
                <span>Si tu hijo compite oficialmente, este código permitirá búsquedas más precisas en FDPN</span>
              </p>
            </div>
          </div>

          {/* Foto del Nadador */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Foto del Nadador
              </h3>
              
              {/* Opciones de foto */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={photoMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhotoMode('url')}
                  className="h-8 text-xs"
                >
                  <Link className="h-3 w-3 mr-1" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={photoMode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhotoMode('upload')}
                  className="h-8 text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Subir
                </Button>
              </div>
            </div>

            {/* Input de URL */}
            {photoMode === 'url' && (
              <div className="space-y-2">
                <Input
                  id="photo"
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={formData.photo}
                  onChange={(e) => {
                    setFormData({ ...formData, photo: e.target.value });
                    setPhotoPreview(e.target.value);
                    setPhotoFile(null);
                  }}
                  className="h-11"
                />
              </div>
            )}

            {/* Input de archivo */}
            {photoMode === 'upload' && (
              <div className="space-y-2">
                <Input
                  id="photoFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="h-11 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  JPG, PNG o GIF. Se comprimirá automáticamente.
                </p>
              </div>
            )}

            {/* Preview de la foto */}
            {photoPreview && (
              <div className="relative inline-block">
                <div className="w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setPhotoPreview(null);
                      toast.error('Error al cargar la imagen');
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-md"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
              className="h-11 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name || !formData.birthDate || !formData.gender}
              className="h-11 w-full sm:w-auto min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Procesando...
                </>
              ) : (
                swimmer ? '✓ Actualizar' : '➕ Crear Nadador'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}