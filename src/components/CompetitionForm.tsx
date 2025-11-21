import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Users, Trophy, FileText, X, Loader2 } from "lucide-react";

interface StyleConfig {
  id?: string;
  style: string;
  nameEs: string;
  nameEn: string;
  description?: string;
  isActive?: boolean;
}

interface PoolConfig {
  id: string;
  poolSize: string;
  nameEs: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
}

interface Competition {
  id: string;
  style: string;
  poolSize: string;
  competition: string;
  date: string;
  distance: number;
  time: number;
  position?: number;
  medal?: string;
  notes?: string;
  isPersonalBest: boolean;
  child: {
    id: string;
    name: string;
  };
}

interface Swimmer {
  id: string;
  name: string;
  photo?: string | null;
}

interface CompetitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  competition?: Competition | null;
}

export default function CompetitionForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  competition 
}: CompetitionFormProps) {
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [styles, setStyles] = useState<StyleConfig[]>([]);
  const [poolTypes, setPoolTypes] = useState<PoolConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMediaGalleryAddon, setHasMediaGalleryAddon] = useState(false);
  const [lastCompetitionName, setLastCompetitionName] = useState<string | null>(null);
  const [hasLastCompetition, setHasLastCompetition] = useState(false);
  
  const [formData, setFormData] = useState({
    childId: '',
    style: '',
    poolSize: '',
    competition: '',
    date: '',
    distance: '',
    time: '', // Mantenemos como string para mostrar formato legible
    position: '',
    medal: '',
    notes: '',
    enableMediaGallery: false // Add-on para fotos/videos
  });

  // Estado adicional para mostrar el tiempo en formato legible
  const [timeDisplay, setTimeDisplay] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Estados para el sistema de upload de medias
  const [uploadedMedias, setUploadedMedias] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Estados para checkboxes de competencia
  const [isInternalCompetition, setIsInternalCompetition] = useState(false);
  const [usePreviousTournament, setUsePreviousTournament] = useState(false);

  // Cargar nadadores al abrir el formulario
  useEffect(() => {
    if (isOpen) {
      fetchSwimmers();
      fetchConfigurations();
      checkMediaGalleryAddon();
      fetchLastCompetition();
      
      if (competition) {
        // Modo edición
        const timeInSeconds = competition.time;
        const timeFormatted = secondsToTimeFormat(timeInSeconds);
        
        setFormData({
          childId: competition.child.id,
          style: competition.style,
          poolSize: competition.poolSize,
          competition: competition.competition,
          date: competition.date.split('T')[0], // Formato YYYY-MM-DD
          distance: competition.distance.toString(),
          time: competition.time.toString(),
          position: competition.position?.toString() || '',
          medal: competition.medal || 'NONE',
          notes: competition.notes || '',
          enableMediaGallery: false
        });
        
        setTimeDisplay(timeFormatted);
      } else {
        // Modo creación - resetear formulario
        resetForm();
      }
    }
  }, [isOpen, competition]);

  const fetchSwimmers = async () => {
    try {
      const response = await fetch('/api/swimmers');
      if (response.ok) {
        const data = await response.json();
        setSwimmers(data);
      }
    } catch (error) {
      console.error('Error fetching swimmers:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const [stylesRes, poolsRes] = await Promise.all([
        fetch('/api/config/styles'),
        fetch('/api/config?type=pools')
      ]);

      if (stylesRes.ok) {
        const stylesData = await stylesRes.json();
        setStyles(stylesData);
      }
      if (poolsRes.ok) {
        const poolsData = await poolsRes.json();
        setPoolTypes(poolsData);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const checkMediaGalleryAddon = async () => {
    try {
      const response = await fetch('/api/parents/subscription');
      if (response.ok) {
        const data = await response.json();
        // Verificar si la suscripción tiene el add-on activo
        setHasMediaGalleryAddon(data.subscription?.mediaGalleryAddon || false);
      }
    } catch (error) {
      console.error('Error checking media gallery addon:', error);
      setHasMediaGalleryAddon(false);
    }
  };

  const fetchLastCompetition = async () => {
    try {
      const response = await fetch('/api/competitions/last-competition');
      if (response.ok) {
        const data = await response.json();
        setHasLastCompetition(data.hasLastCompetition);
        setLastCompetitionName(data.competitionName);
      }
    } catch (error) {
      console.error('Error fetching last competition:', error);
      setHasLastCompetition(false);
      setLastCompetitionName(null);
    }
  };

  const showMediaGalleryMessage = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📸</span>
                Galería de Medios
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Guarda fotos y videos de las competencias por solo <span className="font-semibold text-purple-600">+S/15/mes</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-semibold text-amber-600">⚠️ Límite: 100 MB por archivo</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Videos largos: comprime antes de subir
              </p>
            </div>
            <div
              role="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg cursor-pointer"
            >
              ✕
            </div>
          </div>
          <div
            role="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.dismiss(t.id);
              window.location.href = '/parents/cuenta';
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm cursor-pointer text-center"
          >
            Ir a Mi Cuenta →
          </div>
        </div>
      ),
      {
        duration: 6000,
        style: {
          maxWidth: '400px',
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({
      childId: '',
      style: '',
      poolSize: '',
      competition: '',
      date: new Date().toISOString().split('T')[0], // Fecha actual
      distance: '',
      time: '',
      position: '',
      medal: 'NONE',
      notes: '',
      enableMediaGallery: false
    });
    setTimeDisplay(''); // Limpiar también el display del tiempo
    setUploadedMedias([]); // Limpiar medias subidos
    setIsInternalCompetition(false);
    setUsePreviousTournament(false);
  };

  // Manejar cambio de checkbox "Competencia Interna"
  const handleInternalCompetitionChange = (checked: boolean) => {
    setIsInternalCompetition(checked);
    if (checked) {
      setUsePreviousTournament(false); // Desmarcar el otro
      setFormData({ ...formData, competition: 'COMPETENCIA INTERNA' });
    } else {
      setFormData({ ...formData, competition: '' });
    }
  };

  // Manejar cambio de checkbox "Torneo Anterior"
  const handlePreviousTournamentChange = (checked: boolean) => {
    setUsePreviousTournament(checked);
    if (checked) {
      setIsInternalCompetition(false); // Desmarcar el otro
      if (lastCompetitionName) {
        setFormData({ ...formData, competition: lastCompetitionName });
      }
    } else {
      setFormData({ ...formData, competition: '' });
    }
  };

  // Manejar upload de archivos a Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limitar a 2 archivos máximo
    const totalFiles = uploadedMedias.length + files.length;
    if (totalFiles > 2) {
      toast.error('Máximo 2 fotos/videos por competencia');
      return;
    }

    // Validar tamaño de archivos (100 MB máximo)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB en bytes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        toast.error(
          `❌ ${file.name} es muy grande (${sizeMB} MB)\n\n` +
          `Límite: 100 MB\n\n` +
          `💡 Comprime el video antes de subir:\n` +
          `• freeconvert.com/video-compressor\n` +
          `• videosmaller.com`,
          { duration: 6000 }
        );
        e.target.value = ''; // Resetear input
        return;
      }
    }

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        });

        // Clonar la respuesta para poder leerla múltiples veces si es necesario
        const clonedResponse = response.clone();

        if (!response.ok) {
          let errorMessage = 'Error al subir archivo';
          
          // Intentar leer como JSON primero
          try {
            const errorData = await response.json();
            console.error('❌ Upload error:', errorData);
            errorMessage = errorData.details || errorData.error || errorMessage;
          } catch (jsonError) {
            // Si falla, usar la respuesta clonada para leer como texto
            try {
              const errorText = await clonedResponse.text();
              console.error('❌ Upload error (non-JSON):', errorText.substring(0, 500));
              
              // Mensajes específicos según el error
              if (response.status === 502 || response.status === 504) {
                errorMessage = 'El archivo es muy grande o tardó demasiado en subir. Intenta con un video más corto.';
              } else if (response.status === 413) {
                errorMessage = 'El archivo es demasiado grande (máximo 100MB).';
              } else {
                errorMessage = `Error del servidor (${response.status})`;
              }
            } catch (textError) {
              errorMessage = `Error del servidor (${response.status})`;
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.media;
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Error al subir ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r !== null);
      
      setUploadedMedias(prev => [...prev, ...successfulUploads]);
      toast.success(`${successfulUploads.length} archivo(s) subido(s) correctamente`);
      
      // Resetear input
      e.target.value = '';
    } catch (error) {
      console.error('Error en uploads:', error);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar media subido
  const handleRemoveMedia = (index: number) => {
    setUploadedMedias(prev => prev.filter((_, i) => i !== index));
    toast.success('Archivo eliminado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.childId || !formData.style || !formData.poolSize || 
        !formData.competition || !formData.date || !formData.distance || !formData.time) {
      toast.error('Todos los campos marcados con * son obligatorios');
      return;
    }

    // Validar tiempo
    const timeValue = parseFloat(formData.time);
    if (isNaN(timeValue) || timeValue <= 0) {
      toast.error('El tiempo debe ser un número válido mayor a 0');
      return;
    }

    // Validar distancia
    const distanceValue = parseInt(formData.distance);
    if (isNaN(distanceValue) || distanceValue <= 0) {
      toast.error('La distancia debe ser un número válido mayor a 0');
      return;
    }

    // Posición comentada temporalmente, se establecerá como null
    const submissionData = {
      ...formData,
      position: null, // Establecer posición como null por ahora
      medal: formData.medal === 'NONE' ? null : formData.medal // Convertir 'NONE' a null
    };

    setLoading(true);

    try {
      const url = competition 
        ? `/api/competitions/${competition.id}` 
        : '/api/competitions';
      
      const method = competition ? 'PUT' : 'POST';
      
      console.log('Enviando datos:', submissionData); // Para debug
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      console.log('Respuesta del servidor:', response.status); // Para debug

      if (response.ok) {
        // Si hay medias subidos, guardarlos en la BD
        if (uploadedMedias.length > 0) {
          try {
            const swimmer = swimmers.find(s => s.id === formData.childId);
            const mediaResponse = await fetch('/api/competitions/media', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                competitionName: formData.competition,
                competitionDate: formData.date,
                childId: formData.childId,
                clubId: swimmer ? (swimmer as any).clubId : null,
                eventId: null, // Los padres no vinculan a eventos específicos
                medal: formData.medal || null,
                position: formData.position ? parseInt(formData.position) : null,
                uploadedMedias: uploadedMedias,
              }),
            });

            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              console.log('Medias guardados:', mediaData);
            }
          } catch (mediaError) {
            console.error('Error guardando medias:', mediaError);
            // No mostrar error al usuario, la competencia ya se guardó
          }
        }

        toast.success(
          competition 
            ? 'Competencia actualizada exitosamente' 
            : 'Competencia registrada exitosamente'
        );
        onSuccess();
        handleClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
        toast.error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      toast.error('Error de conexión con el servidor. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Función para convertir segundos a formato M:SS.CC
  const secondsToTimeFormat = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds);
    const centiseconds = Math.round((seconds - totalSeconds) * 100);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    // Formato M:SS.CC (siempre minutos en natación)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Función para convertir tiempo en formato M:SS.CC a segundos
  const parseTimeToSeconds = (timeString: string): number => {
    if (!timeString) return 0;
    
    // Limpiar espacios
    timeString = timeString.trim();
    
    // Si no tiene : ni ., es solo segundos
    if (!timeString.includes(':') && !timeString.includes('.')) {
      const seconds = parseFloat(timeString) || 0;
      return seconds;
    }

    // Separar minutos:segundos.centésimas
    let minutesPart = '0';
    let secondsPart = '0';
    let centisecondsPart = '0';

    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      minutesPart = parts[0] || '0';
      
      if (parts[1]) {
        if (parts[1].includes('.')) {
          const secParts = parts[1].split('.');
          secondsPart = secParts[0] || '0';
          centisecondsPart = secParts[1] || '0';
        } else {
          secondsPart = parts[1];
        }
      }
    } else if (timeString.includes('.')) {
      // Solo segundos.centésimas (sin minutos)
      const parts = timeString.split('.');
      secondsPart = parts[0] || '0';
      centisecondsPart = parts[1] || '0';
    }

    const minutes = parseInt(minutesPart) || 0;
    const seconds = parseInt(secondsPart) || 0;
    const centiseconds = parseInt(centisecondsPart.padEnd(2, '0').substring(0, 2)) || 0;
    
    return minutes * 60 + seconds + (centiseconds / 100);
  };

  const handleTimeChange = (value: string) => {
    // Permitir solo números, : y .
    let cleanValue = value.replace(/[^\d:.]/g, '');
    
    // Remover múltiples : o .
    cleanValue = cleanValue.replace(/:+/g, ':').replace(/\.+/g, '.');
    
    // Auto-formatear mientras escribe (formato natación: M:SS.CC)
    // Eliminar : y . para procesar solo números
    const digitsOnly = cleanValue.replace(/[:.]/g, '');
    
    if (digitsOnly.length > 0) {
      let formatted = '';
      
      if (digitsOnly.length <= 2) {
        // 1-2 dígitos: solo segundos (ej: "5" o "59")
        formatted = digitsOnly;
      } else if (digitsOnly.length === 3) {
        // 3 dígitos: M:SS (ej: "102" → "1:02")
        formatted = `${digitsOnly[0]}:${digitsOnly.substring(1)}`;
      } else if (digitsOnly.length === 4) {
        // 4 dígitos: M:SS (ej: "1025" → "10:25")
        formatted = `${digitsOnly.substring(0, 2)}:${digitsOnly.substring(2)}`;
      } else if (digitsOnly.length === 5) {
        // 5 dígitos: M:SS.C (ej: "10259" → "1:02.59" o "40295" → "4:02.95")
        formatted = `${digitsOnly[0]}:${digitsOnly.substring(1, 3)}.${digitsOnly.substring(3)}`;
      } else if (digitsOnly.length >= 6) {
        // 6+ dígitos: MM:SS.CC (ej: "100295" → "10:02.95")
        formatted = `${digitsOnly.substring(0, digitsOnly.length - 4)}:${digitsOnly.substring(digitsOnly.length - 4, digitsOnly.length - 2)}.${digitsOnly.substring(digitsOnly.length - 2)}`;
      }
      
      cleanValue = formatted;
    }
    
    // Actualizar el display
    setTimeDisplay(cleanValue);
    
    // Convertir a segundos para almacenar
    const timeInSeconds = parseTimeToSeconds(cleanValue);
    setFormData(prev => ({ ...prev, time: timeInSeconds.toString() }));
    
    // Log para debugging
    console.log('Time changed:', {
      input: value,
      digitsOnly,
      formatted: cleanValue,
      timeInSeconds
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[900px] max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden"
        onInteractOutside={(e) => {
          // No cerrar el modal si se hace clic en un toast
          const target = e.target as HTMLElement;
          if (target.closest('[data-sonner-toaster]') || target.closest('[data-toast]') || target.closest('[role="status"]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Header fijo con gradiente azul */}
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                {competition ? 'Editar Competencia' : 'Crear Nueva Competencia'}
              </DialogTitle>
              <p className="text-sm text-blue-100 mt-1">
                {competition ? 'Actualiza los datos de la competencia' : 'Completa los datos para registrar un nuevo resultado'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FILA 1: Nadador (izq) + Detalles de Competencia (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* COLUMNA 1: Nadador */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3 rounded-l">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Nadador</h3>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                  {/* FILA 1: Select/Foto dinámico + Select (cuando hay selección) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Columna 1: Select (sin selección) o Foto (con selección) - h-24 */}
                    <div className="h-24 sm:h-24 flex items-center w-full">
                      {!formData.childId ? (
                        // Mostrar selector cuando NO hay nadador
                        <div className="w-full space-y-2">
                          <Label htmlFor="childId" className="text-sm font-medium text-gray-700">Selecciona el nadador *</Label>
                          <Select
                            value={formData.childId}
                            onValueChange={(value) => setFormData({ ...formData, childId: value })}
                          >
                            <SelectTrigger className="h-10 rounded-lg w-full">
                              <SelectValue placeholder="Seleccionar nadador" />
                            </SelectTrigger>
                            <SelectContent>
                              {swimmers.map((swimmer) => (
                                <SelectItem key={swimmer.id} value={swimmer.id}>
                                  {swimmer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        // Mostrar foto cuando YA hay nadador
                        (() => {
                          const selectedSwimmer = swimmers.find(s => s.id === formData.childId);
                          const photoUrl = selectedSwimmer?.photo;
                          return photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt="Nadador"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-3xl">👤</span>
                            </div>
                          );
                        })()
                      )}
                    </div>
                    
                    {/* Columna 2: Select (solo cuando hay selección) - h-24 */}
                    {formData.childId && (
                      <div className="h-24 sm:h-24 flex items-center w-full">
                        <div className="w-full space-y-2">
                          <Label htmlFor="childId" className="text-sm font-medium text-gray-700">Nadador seleccionado *</Label>
                          <Select
                            value={formData.childId}
                            onValueChange={(value) => setFormData({ ...formData, childId: value })}
                          >
                            <SelectTrigger className="h-10 rounded-lg w-full">
                              <SelectValue placeholder="Seleccionar nadador" />
                            </SelectTrigger>
                            <SelectContent>
                              {swimmers.map((swimmer) => (
                                <SelectItem key={swimmer.id} value={swimmer.id}>
                                  {swimmer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* FILA 2: Checkbox Galería (VERTICAL) + Uploader */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Columna 1: Checkbox VERTICAL (ícono arriba, checkbox + texto abajo) */}
                    <div className="h-20 sm:h-24 p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 flex flex-col items-center justify-center">
                      {/* Ícono arriba */}
                      <span className="text-2xl mb-1">📸</span>
                      
                      {/* Checkbox + texto abajo */}
                      <div className="flex items-start gap-1.5">
                        <input
                          id="mediaGallery"
                          type="checkbox"
                          checked={formData.enableMediaGallery || false}
                          disabled={!hasMediaGalleryAddon}
                          onChange={(e) => {
                            if (!hasMediaGalleryAddon) {
                              showMediaGalleryMessage();
                              return;
                            }
                            setFormData({ ...formData, enableMediaGallery: e.target.checked });
                          }}
                          className={`h-3.5 w-3.5 rounded border-gray-300 focus:ring-purple-500 mt-0.5 ${
                            hasMediaGalleryAddon ? 'text-purple-600 cursor-pointer' : 'text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        />
                        <label 
                          htmlFor="mediaGallery" 
                          className={`text-[11px] text-left leading-snug ${
                            hasMediaGalleryAddon ? 'text-gray-700 cursor-pointer' : 'text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            if (!hasMediaGalleryAddon) {
                              e.preventDefault();
                              showMediaGalleryMessage();
                            }
                          }}
                        >
                          Guarda fotos y videos <span className="block text-[10px] font-semibold text-blue-600">Max 30MB</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Columna 2: Uploader con Previews DENTRO */}
                    <div className="space-y-2">
                      <div className={`border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${
                        formData.enableMediaGallery 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-300 bg-gray-100 opacity-60'
                      }`}>
                        {/* Previews de archivos subidos DENTRO del contenedor */}
                        {uploadedMedias.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {uploadedMedias.map((media, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-video rounded-lg overflow-hidden border-2 border-purple-300 bg-gray-100">
                                  {media.resourceType === 'video' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                      <span className="text-3xl">🎥</span>
                                    </div>
                                  ) : (
                                    <img 
                                      src={media.thumbnailUrl} 
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedia(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Botón para subir más (si hay espacio) */}
                        {uploadedMedias.length < 2 && (
                          <div className="flex flex-col items-center justify-center gap-1">
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <p className="text-[10px] font-medium text-purple-600">Subiendo...</p>
                              </>
                            ) : (
                              <>
                                {uploadedMedias.length === 0 && (
                                  <>
                                    <span className="text-xl">{formData.enableMediaGallery ? '📤' : '🔒'}</span>
                                    <p className={`text-[10px] font-medium ${formData.enableMediaGallery ? 'text-gray-700' : 'text-gray-500'}`}>
                                      {formData.enableMediaGallery 
                                        ? 'Sube fotos o videos' 
                                        : 'Activa el add-on primero'}
                                    </p>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  multiple
                                  disabled={!formData.enableMediaGallery || uploading}
                                  onChange={handleFileUpload}
                                  className={`block w-full text-[10px] file:mr-1 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold ${
                                    formData.enableMediaGallery
                                      ? 'text-gray-500 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer'
                                      : 'text-gray-400 file:bg-gray-400 file:text-gray-200 cursor-not-allowed'
                                  }`}
                                />
                              </>
                            )}
                          </div>
                        )}

                        {uploadedMedias.length >= 2 && (
                          <p className="text-xs text-center text-purple-600 font-medium">
                            ✓ Máximo alcanzado (2 archivos)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: Detalles de la Competencia */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3 rounded-l">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detalles de la Competencia</h3>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Fila 1: Estilo + Tipo de Competencia */}
                    {/* Estilo - Campo 1 */}
                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                        Estilo *
                      </Label>
                      <Select
                        value={formData.style}
                        onValueChange={(value) => setFormData({ ...formData, style: value })}
                      >
                        <SelectTrigger className="h-10 sm:h-11 rounded-lg">
                          <SelectValue placeholder="Seleccionar estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((style) => (
                            <SelectItem key={style.style} value={style.style}>
                              {style.nameEs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de Competencia - Campo 2 */}
                    <div className="space-y-2">
                      <Label htmlFor="poolSize" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                        Tipo de Competencia *
                      </Label>
                      <Select
                        value={formData.poolSize}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            poolSize: value,
                            distance: '' // Limpiar distancia al cambiar tipo
                          });
                        }}
                        disabled={!formData.style}
                      >
                        <SelectTrigger className="h-10 sm:h-11 rounded-lg">
                          <SelectValue placeholder="Tipo de competencia" />
                        </SelectTrigger>
                        <SelectContent>
                          {poolTypes.map((pool) => (
                            <SelectItem key={pool.id} value={pool.poolSize}>
                              {pool.nameEs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fila 2: Distancia + Tiempo */}
                    {/* Distancia - Campo 3 */}
                    <div className="space-y-2">
                      <Label htmlFor="distance" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
                        Distancia *
                      </Label>
                      <Select
                        value={formData.distance}
                        onValueChange={(value) => setFormData({ ...formData, distance: value })}
                        disabled={!formData.poolSize}
                      >
                        <SelectTrigger className="h-10 sm:h-11 rounded-lg">
                          <SelectValue placeholder="Distancia" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.poolSize === 'OPEN_WATER' ? (
                            // Distancias para aguas abiertas
                            <>
                              <SelectItem value="800">800m</SelectItem>
                              <SelectItem value="1500">1.5km (1500m)</SelectItem>
                              <SelectItem value="3000">3km (3000m)</SelectItem>
                              <SelectItem value="5000">5km (5000m)</SelectItem>
                              <SelectItem value="10000">10km (10000m)</SelectItem>
                              <SelectItem value="25000">25km (25000m)</SelectItem>
                            </>
                          ) : (
                            // Distancias para piscina
                            <>
                              <SelectItem value="25">25m</SelectItem>
                              <SelectItem value="50">50m</SelectItem>
                              <SelectItem value="100">100m</SelectItem>
                              <SelectItem value="200">200m</SelectItem>
                              <SelectItem value="400">400m</SelectItem>
                              <SelectItem value="800">800m</SelectItem>
                              <SelectItem value="1500">1500m</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tiempo - Campo 4 */}
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
                        Tiempo *
                      </Label>
                      <Input
                        id="time"
                        type="text"
                        placeholder="Ej: 40295"
                        value={timeDisplay}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="h-10 sm:h-11 font-mono text-base sm:text-lg rounded-lg"
                        disabled={!formData.distance}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Auto-formato: 40295 → 4:02.95 (minutos:segundos.centésimas)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FILA 2: Información Adicional */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Información Adicional</h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="space-y-3">
                  {/* Checkboxes para llenado rápido */}
                  <div className="flex flex-wrap gap-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <input
                        type="checkbox"
                        id="internalCompetition"
                        checked={isInternalCompetition}
                        onChange={(e) => handleInternalCompetitionChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="internalCompetition" className="text-sm font-medium text-gray-700 cursor-pointer">
                        📌 Competencia Interna
                      </label>
                    </div>
                    
                    {hasLastCompetition && (
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                        <input
                          type="checkbox"
                          id="previousTournament"
                          checked={usePreviousTournament}
                          onChange={(e) => handlePreviousTournamentChange(e.target.checked)}
                          className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <label htmlFor="previousTournament" className="text-sm font-medium text-gray-700 cursor-pointer">
                          🔄 Torneo Anterior
                        </label>
                        {lastCompetitionName && (
                          <span className="text-xs text-purple-600 font-semibold">
                            ({lastCompetitionName.substring(0, 20)}{lastCompetitionName.length > 20 ? '...' : ''})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Primera fila: Nombre, Fecha, Medalla, Notas (checkbox) */}
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                    {/* Nombre de la Competencia */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="competition" className="text-sm font-medium text-gray-700">Nombre de la Competencia *</Label>
                      <Input
                        id="competition"
                        type="text"
                        placeholder="ej: CAMPEONATO NACIONAL"
                        value={formData.competition}
                        onChange={(e) => {
                          setFormData({ ...formData, competition: e.target.value.toUpperCase() });
                          // Desmarcar checkboxes si el usuario edita manualmente
                          if (isInternalCompetition) setIsInternalCompetition(false);
                          if (usePreviousTournament) setUsePreviousTournament(false);
                        }}
                        className="h-10 rounded-lg uppercase"
                        required
                      />
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="h-10 rounded-lg"
                        required
                      />
                    </div>

                    {/* Medalla obtenida */}
                    <div className="space-y-2">
                      <Label htmlFor="medal" className="text-sm font-medium text-gray-700">Medalla</Label>
                      <Select
                        value={formData.medal}
                        onValueChange={(value) => setFormData({ ...formData, medal: value })}
                      >
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="Sin medalla" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">Sin medalla</SelectItem>
                          <SelectItem value="GOLD">🥇 Oro</SelectItem>
                          <SelectItem value="SILVER">🥈 Plata</SelectItem>
                          <SelectItem value="BRONZE">🥉 Bronce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checkbox Notas */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 invisible">Placeholder</Label>
                      <div className="flex items-center gap-2 h-10">
                        <input
                          id="showNotes"
                          type="checkbox"
                          checked={showNotes}
                          onChange={(e) => setShowNotes(e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="showNotes" className="text-sm text-gray-700 cursor-pointer">
                          Notas
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Segunda fila (condicional): Textarea de notas */}
                  {showNotes && (
                    <div>
                      <Textarea
                        id="notes"
                        placeholder="Observaciones..."
                        value={formData.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="resize-none rounded-lg border-0 bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 shadow-lg border-t-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-10 sm:h-11 border-gray-300"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {competition ? 'Actualizando...' : 'Guardando...'}
              </div>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                {competition ? 'Actualizar Competencia' : 'Crear Competencia'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}