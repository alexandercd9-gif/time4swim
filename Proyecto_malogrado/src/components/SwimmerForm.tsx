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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {swimmer ? 'Editar Nadador' : 'Crear Nuevo Nadador'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nombre completo del nadador"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>

          {/* Género */}
          <div className="space-y-2">
            <Label htmlFor="gender">Género *</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Masculino</SelectItem>
                <SelectItem value="FEMALE">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Club */}
          <div className="space-y-2">
            <Label htmlFor="clubId">Club</Label>
            <Select
              value={formData.clubId}
              onValueChange={(value) => setFormData({ ...formData, clubId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin club</SelectItem>
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
            <Label htmlFor="coach">Entrenador</Label>
            <Input
              id="coach"
              type="text"
              placeholder="Nombre del entrenador"
              value={formData.coach}
              onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
            />
          </div>

          {/* Código de Afiliado FDPN */}
          <div className="space-y-2">
            <Label htmlFor="fdpnAffiliateCode">Código de Afiliado FDPN (Opcional)</Label>
            <Input
              id="fdpnAffiliateCode"
              type="text"
              placeholder="Ej: 79272554"
              value={formData.fdpnAffiliateCode}
              onChange={(e) => setFormData({ ...formData, fdpnAffiliateCode: e.target.value })}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              🔍 Si tu hijo ya compite oficialmente, este código permitirá búsquedas más precisas en FDPN
            </p>
          </div>

          {/* Foto del Nadador */}
          <div className="space-y-3">
            <Label>Foto del Nadador</Label>
            
            {/* Opciones de foto */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={photoMode === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhotoMode('url')}
                className="flex items-center space-x-1"
              >
                <Link className="h-4 w-4" />
                <span>URL</span>
              </Button>
              <Button
                type="button"
                variant={photoMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPhotoMode('upload')}
                className="flex items-center space-x-1"
              >
                <Upload className="h-4 w-4" />
                <span>Subir Archivo</span>
              </Button>
            </div>

            {/* Input de URL */}
            {photoMode === 'url' && (
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
              />
            )}

            {/* Input de archivo */}
            {photoMode === 'upload' && (
              <div>
                <div className="relative">
                  <Input
                    id="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-2 h-12 flex items-center file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Formatos soportados: JPG, PNG, GIF. Se comprimirá automáticamente.
                </p>
              </div>
            )}

            {/* Preview de la foto */}
            {photoPreview && (
              <div className="relative">
                <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
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
                  variant="outline"
                  size="sm"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name || !formData.birthDate || !formData.gender}
            >
              {loading ? 'Procesando...' : (swimmer ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}