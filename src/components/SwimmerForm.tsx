"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Upload, Link, X, Info } from "lucide-react";
import { calculateCategory, formatCategory } from "@/lib/categories";

interface Club {
  id: string;
  name: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
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
    name: "",
    birthDate: "",
    gender: "",
    clubId: "",
    coach: "",
    photo: "",
    fdpnAffiliateCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url');

  // Cargar clubes cuando se abre el formulario
  useEffect(() => {
    if (isOpen) {
      fetchClubs();
    }
  }, [isOpen]);

  // Cargar entrenadores cuando se abre el modal con un club ya seleccionado
  useEffect(() => {
    if (isOpen && swimmer?.club?.id) {
      console.log('🏊‍♂️ Modal abierto con club pre-seleccionado:', swimmer.club.id);
      fetchCoaches(swimmer.club.id);
    }
  }, [isOpen, swimmer]);

  // Inicializar datos del formulario cuando cambia el swimmer o se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('📝 Inicializando formulario. Swimmer:', swimmer ? 'Editar' : 'Crear nuevo');
      if (swimmer) {
        const newFormData = {
          name: swimmer.name || "",
          birthDate: swimmer.birthDate ? swimmer.birthDate.split('T')[0] : "",
          gender: swimmer.gender || "",
          clubId: swimmer.club?.id || "",
          coach: swimmer.coach || "",
          photo: swimmer.photo || "",
          fdpnAffiliateCode: ""
        };
        console.log('📝 Datos del formulario (editar):', newFormData);
        setFormData(newFormData);
        setPhotoPreview(swimmer.photo || null);
        setPhotoFile(null);
      } else {
        // Reset para crear nuevo
        console.log('📝 Reseteando formulario para crear nuevo nadador');
        setFormData({
          name: "",
          birthDate: "",
          gender: "",
          clubId: "",
          coach: "",
          photo: "",
          fdpnAffiliateCode: ""
        });
        setPhotoPreview(null);
        setPhotoFile(null);
        setCoaches([]); // Limpiar entrenadores al crear nuevo
      }
      setPhotoMode('url');
    }
  }, [isOpen, swimmer]);

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

  const fetchCoaches = async (clubId: string) => {
    if (!clubId) {
      console.log('❌ No hay clubId, limpiando entrenadores');
      setCoaches([]);
      return;
    }
    
    console.log('🔍 Buscando entrenadores para club:', clubId);
    
    try {
      const response = await fetch(`/api/clubs/${clubId}/coaches`);
      console.log('📡 Respuesta de API:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Entrenadores recibidos:', data.length, data);
        setCoaches(data);
      } else {
        console.log('❌ Error en respuesta:', response.status);
        setCoaches([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar entrenadores:', error);
      setCoaches([]);
    }
  };

  // Cargar entrenadores cuando cambia el club
  useEffect(() => {
    console.log('🔄 useEffect detectó cambio en clubId:', formData.clubId);
    if (formData.clubId) {
      fetchCoaches(formData.clubId);
    } else {
      console.log('⚠️ clubId está vacío, limpiando entrenadores');
      setCoaches([]);
      setFormData(prev => ({ ...prev, coach: '' }));
    }
  }, [formData.clubId]);

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

      console.log('📤 SwimmerForm - Datos a enviar:', {
        ...submitData,
        photo: submitData.photo ? `[${submitData.photo.length} caracteres]` : 'null'
      });

      const url = swimmer 
        ? `/api/swimmers/${swimmer.id}` 
        : '/api/swimmers';
      
      const method = swimmer ? 'PUT' : 'POST';
      console.log(`📤 ${method} ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Respuesta del servidor:', result);
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
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {swimmer ? (
                <>
                  <span className="text-3xl">✏️</span>
                  <span>Editar Nadador</span>
                </>
              ) : (
                <>
                  <span className="text-3xl filter brightness-0 invert">➕</span>
                  <span>Crear Nuevo Nadador</span>
                </>
              )}
            </DialogTitle>
            <p className="text-sm text-blue-100">
              {swimmer ? 'Actualiza la información del nadador' : 'Completa los datos para registrar un nuevo nadador'}
            </p>
          </DialogHeader>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
        
        <form id="swimmer-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">
                Información Personal
              </h3>
            </div>
            
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
                  className="h-11 w-full"
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
                    <SelectItem value="MALE">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">👦</span>
                        <span>Masculino</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="FEMALE">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">👧</span>
                        <span>Femenino</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mostrar categoría calculada automáticamente */}
            {formData.birthDate && (
              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">
                      Categoría Automática
                    </p>
                    <p className="text-blue-700">
                      {formatCategory(calculateCategory(formData.birthDate))}. Se calcula según el año de nacimiento
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del Club */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-8 w-1 bg-green-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">
                Información del Club
              </h3>
            </div>

            {/* Club y Entrenador en grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Club */}
              <div className="space-y-2">
                <Label htmlFor="clubId" className="text-sm font-medium">Club</Label>
                <Select
                  value={formData.clubId || "none"}
                  onValueChange={(value) => {
                    const newClubId = value === "none" ? "" : value;
                    console.log('🏊 Club seleccionado:', value, '→ clubId:', newClubId);
                    setFormData({ ...formData, clubId: newClubId });
                  }}
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
                <Select
                  value={formData.coach || "none"}
                  onValueChange={(value) => setFormData({ ...formData, coach: value === "none" ? "" : value })}
                  disabled={!formData.clubId || coaches.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={
                      !formData.clubId 
                        ? "Primero selecciona un club" 
                        : coaches.length === 0 
                          ? "Sin entrenadores disponibles"
                          : "Seleccionar entrenador"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin entrenador asignado</SelectItem>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.name}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.clubId && coaches.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700 flex items-start gap-2">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Este club no tiene entrenadores registrados</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Código FDPN */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">
                Información Adicional
              </h3>
            </div>

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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Si tu hijo compite oficialmente, este código permitirá búsquedas más precisas en FDPN</span>
                </p>
              </div>
            </div>
          </div>

          {/* Foto del Nadador */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-orange-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">
                  Foto del Nadador
                </h3>
              </div>
              
              {/* Opciones de foto */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={photoMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhotoMode('url')}
                  className="h-9 text-sm flex-1 sm:flex-none"
                >
                  <Link className="h-4 w-4 mr-2" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={photoMode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPhotoMode('upload')}
                  className="h-9 text-sm flex-1 sm:flex-none"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
            </div>

            {/* Input de URL */}
            {photoMode === 'url' && (
              <>
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
                {/* Preview de la foto para URL */}
                {photoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                    <div className="relative inline-block">
                      <div className="w-32 h-32 border-4 border-white rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ring-2 ring-blue-100">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Input de archivo */}
            {photoMode === 'upload' && (
              <>
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
                {/* Preview de la foto para archivo subido */}
                {photoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                    <div className="relative inline-block">
                      <div className="w-32 h-32 border-4 border-white rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ring-2 ring-blue-100">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
            className="h-11 w-full sm:w-auto px-6"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            form="swimmer-form"
            disabled={loading || !formData.name || !formData.birthDate || !formData.gender}
            className="h-11 w-full sm:w-auto min-w-[150px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={(e) => {
              e.preventDefault();
              const form = document.getElementById('swimmer-form') as HTMLFormElement;
              form?.requestSubmit();
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              swimmer ? (
                <>
                  <span className="text-lg mr-2">✓</span>
                  Actualizar
                </>
              ) : (
                <>
                  <span className="text-lg mr-2 filter brightness-0 invert">➕</span>
                  Crear Nadador
                </>
              )
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}