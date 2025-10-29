import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "react-hot-toast";
import { CheckCircle2, Circle, Users, Trophy, FileText } from "lucide-react";

interface StyleConfig {
  id: string;
  style: string;
  nameEs: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
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
    notes: ''
  });

  // Estado adicional para mostrar el tiempo en formato legible
  const [timeDisplay, setTimeDisplay] = useState('');
  
  // Estados para el acordeón
  const [openSections, setOpenSections] = useState<string[]>(['swimmer']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Cargar nadadores al abrir el formulario
  useEffect(() => {
    if (isOpen) {
      fetchSwimmers();
      fetchConfigurations();
      
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
          notes: competition.notes || ''
        });
        
        setTimeDisplay(timeFormatted);
      } else {
        // Modo creación - resetear formulario
        resetForm();
      }
    }
  }, [isOpen, competition]);

  // Funciones de validación para cada sección
  const validateSwimmerSection = () => {
    return formData.childId !== '';
  };

  const validateCompetitionSection = () => {
    // Validar que todos los campos estén completados
    const basicValidation = formData.style !== '' && 
                           formData.poolSize !== '' && 
                           formData.distance !== '' && 
                           formData.time !== '' &&
                           parseFloat(formData.time) > 0;
    
    // Validar formato de tiempo - debe tener al menos MM:SS
    const isValidTimeFormat = () => {
      if (!timeDisplay) return false;
      
      // Permitir varios formatos: MM:SS, HH:MM:SS, MM:SS:CC (con centésimas/milisegundos)
      const timePattern = /^(\d{1,2}:\d{2}|\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2}:\d{2}:\d{2})$/;
      return timePattern.test(timeDisplay.trim());
    };
    
    return basicValidation && isValidTimeFormat();
  };

  const validateAdditionalSection = () => {
    return formData.competition !== '' && formData.date !== '';
  };

  // Función para actualizar secciones completadas
  const updateCompletedSections = () => {
    const completed: string[] = [];
    if (validateSwimmerSection()) completed.push('swimmer');
    if (validateCompetitionSection()) completed.push('competition');
    if (validateAdditionalSection()) completed.push('additional');
    setCompletedSections(completed);
  };

  // Función para manejar cambios en el acordeón
  const handleAccordionChange = (value: string[]) => {
    setOpenSections(value);
  };

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
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setStyles(data.styles);
        setPoolTypes(data.pools);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  // Efecto para actualizar secciones completadas cuando cambien los datos del formulario
  useEffect(() => {
    updateCompletedSections();
  }, [formData]);

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
      notes: ''
    });
    setTimeDisplay(''); // Limpiar también el display del tiempo
    setOpenSections(['swimmer']); // Resetear acordeón a la primera sección
    setCompletedSections([]); // Limpiar secciones completadas
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

  // Función para convertir segundos a formato HH:MM:SS o MM:SS
  const secondsToTimeFormat = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (hours > 0) {
      // Formato HH:MM:SS cuando hay horas
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      // Formato MM:SS cuando no hay horas
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  // Función para convertir tiempo en formato HH:MM:SS, MM:SS a segundos
  const parseTimeToSeconds = (timeString: string): number => {
    if (!timeString) return 0;
    
    // Limpiar espacios
    timeString = timeString.trim();
    
    // Si no tiene :, es solo segundos
    if (!timeString.includes(':')) {
      const seconds = parseFloat(timeString) || 0;
      return seconds;
    }

    const parts = timeString.split(':');
    
    if (parts.length === 2) {
      // Formato MM:SS
      const minutes = parseInt(parts[0]) || 0;
      const secondsPart = parseFloat(parts[1]) || 0; // Usar parseFloat para decimales
      return minutes * 60 + secondsPart;
    } else if (parts.length === 3) {
      // Formato HH:MM:SS
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const secondsPart = parseFloat(parts[2]) || 0; // Usar parseFloat para decimales
      return hours * 3600 + minutes * 60 + secondsPart;
    } else if (parts.length === 4) {
      // Formato HH:MM:SS:CC (con centésimas/milisegundos)
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const seconds = parseInt(parts[2]) || 0;
      const centiseconds = parseInt(parts[3]) || 0;
      return hours * 3600 + minutes * 60 + seconds + (centiseconds / 100);
    } else {
      // Formato inválido, intentar parsear como segundos
      return parseFloat(timeString) || 0;
    }
  };

  const handleTimeChange = (value: string) => {
    // Actualizar el display
    setTimeDisplay(value);
    
    // Convertir a segundos para almacenar
    const timeInSeconds = parseTimeToSeconds(value);
    setFormData(prev => ({ ...prev, time: timeInSeconds.toString() }));
    
    // Log para debugging
    console.log('Time changed:', {
      value,
      timeInSeconds
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[95vh] overflow-y-auto mx-4">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            {competition ? 'Editar Competencia' : 'Nueva Competencia'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Accordion 
            type="multiple" 
            value={openSections} 
            onValueChange={handleAccordionChange}
            className="space-y-4"
          >
            {/* Sección 1: Información del Nadador */}
            <AccordionItem value="swimmer" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {completedSections.includes('swimmer') ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <Users className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">1. Información del Nadador</p>
                    <p className="text-sm text-gray-500">Selecciona el nadador para esta competencia</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="childId" className="text-sm font-medium">Nadador *</Label>
                    <Select
                      value={formData.childId}
                      onValueChange={(value) => setFormData({ ...formData, childId: value })}
                    >
                      <SelectTrigger className="h-11">
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
              </AccordionContent>
            </AccordionItem>

            {/* Sección 2: Detalles de la Competencia */}
            <AccordionItem value="competition" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {completedSections.includes('competition') ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <Trophy className="h-5 w-5 text-cyan-500" />
                  <div className="text-left">
                    <p className="font-medium">2. Detalles de la Competencia</p>
                    <p className="text-sm text-gray-500">Estilo, tipo, distancia y tiempo</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estilo */}
                  <div className="space-y-2">
                    <Label htmlFor="style" className="text-sm font-medium">Estilo *</Label>
                    <Select
                      value={formData.style}
                      onValueChange={(value) => setFormData({ ...formData, style: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style) => (
                          <SelectItem key={style.id} value={style.style}>
                            {style.nameEs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de Competencia */}
                  <div className="space-y-2">
                    <Label htmlFor="poolSize" className="text-sm font-medium">Tipo de Competencia *</Label>
                    <Select
                      value={formData.poolSize}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          poolSize: value,
                          distance: '' // Limpiar distancia al cambiar tipo
                        });
                      }}
                    >
                      <SelectTrigger className="h-11">
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

                  {/* Distancia */}
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="text-sm font-medium">Distancia *</Label>
                    <Select
                      value={formData.distance}
                      onValueChange={(value) => setFormData({ ...formData, distance: value })}
                    >
                      <SelectTrigger className="h-11">
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

                  {/* Tiempo */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">Tiempo *</Label>
                    <Input
                      id="time"
                      type="text"
                      placeholder="ej: 30, 1:30, 3:36:55"
                      value={timeDisplay}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="h-11"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Formatos: SS, MM:SS, HH:MM:SS
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sección 3: Información Adicional */}
            <AccordionItem value="additional" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {completedSections.includes('additional') ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <FileText className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">3. Información Adicional</p>
                    <p className="text-sm text-gray-500">Competencia, fecha y notas</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre de la Competencia */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="competition" className="text-sm font-medium">Nombre de la Competencia *</Label>
                    <Input
                      id="competition"
                      type="text"
                      placeholder="ej: Campeonato Nacional de Natación 2024"
                      value={formData.competition}
                      onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Fecha */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Espacio vacío para mantener el grid */}
                  <div></div>

                  {/* Medalla obtenida */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medal" className="text-sm font-medium">Medalla obtenida</Label>
                    <Select
                      value={formData.medal}
                      onValueChange={(value) => setFormData({ ...formData, medal: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecciona si obtuvo medalla" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Sin medalla</SelectItem>
                        <SelectItem value="GOLD">🥇 Oro</SelectItem>
                        <SelectItem value="SILVER">🥈 Plata</SelectItem>
                        <SelectItem value="BRONZE">🥉 Bronce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notas */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Notas</Label>
                    <Textarea
                      id="notes"
                      placeholder="Observaciones, condiciones de la competencia, records personales, etc."
                      value={formData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {competition ? 'Actualizando...' : 'Guardando...'}
                </div>
              ) : (
                competition ? 'Actualizar Competencia' : 'Guardar Competencia'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}