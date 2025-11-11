"use client";

import { useState, useEffect, use, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Clock, User, Hash, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPusherClient, subscribeToPusherChannel, unsubscribeFromPusherChannel } from "@/lib/pusher-client";

interface Lane {
  id: string;
  laneNumber: number;
  swimmer?: {
    id: string;
    name: string;
    lastName: string;
    birthDate: string;
  };
  finalTime?: number;
}

interface Event {
  id: string;
  title: string;
  distance: number;
  style: string;
}

export default function ProfesorLaneControlPage({
  params,
}: {
  params: Promise<{ id: string; laneId: string }>;
}) {
  const resolvedParams = use(params);
  const { id: eventId, laneId } = resolvedParams;
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [lane, setLane] = useState<Lane | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado del tiempo registrado
  const [recordedTime, setRecordedTime] = useState<number | null>(null);

  // Estado del cronómetro LOCAL del profesor (independiente)
  const [localTime, setLocalTime] = useState(0);
  const [localRunning, setLocalRunning] = useState(false);
  const localStartTimeRef = useRef<number | null>(null); // Timestamp de inicio local

  // Función para cargar datos del carril
  const fetchLaneData = async () => {
    try {
      const laneRes = await fetch(`/api/club/lanes/${laneId}`);
      if (laneRes.ok) {
        const laneData = await laneRes.json();
        setLane(laneData);
      }
    } catch (error) {
      console.error("Error fetching lane data:", error);
    }
  };

  // Cargar datos del evento y carril
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener info del evento
        const eventRes = await fetch(`/api/club/events/${eventId}`);
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEvent(eventData);
        }

        // Obtener info del carril
        await fetchLaneData();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, laneId]);

  // Cronómetro LOCAL - se actualiza cada 10ms cuando está corriendo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (localRunning && localStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Date.now() - localStartTimeRef.current!;
        setLocalTime(elapsed);
      }, 10); // Actualizar cada 10ms para precisión visual
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [localRunning]);

  // Pusher: Suscribirse a eventos del admin
  useEffect(() => {
    if (!eventId) return;

    const channelName = `event-${eventId}`;
    const channel = subscribeToPusherChannel(channelName);

    if (channel) {
      console.log(`📡 Profesor suscrito al canal: ${channelName}`);

      // Escuchar cuando el admin da la señal de START
      channel.bind('heat-start', (data: any) => {
        console.log('🏁 Admin dio START a la carrera:', data);
        
        // Solo iniciar cronómetro si este carril tiene un nadador asignado
        if (lane?.swimmer) {
          // Iniciar cronómetro LOCAL inmediatamente
          const startTime = Date.now();
          localStartTimeRef.current = startTime;
          setLocalTime(0);
          setLocalRunning(true);
          
          toast.dismiss(); // Limpiar toasts anteriores
          toast.success('🏁 ¡CARRERA INICIADA! Cronómetro en marcha', { 
            duration: 3000,
            icon: '🏊',
            id: 'heat-start' // ID único para evitar duplicados
          });
        } else {
          // Si no hay nadador asignado, mostrar mensaje informativo
          toast.dismiss();
          toast('ℹ️ Carrera iniciada - Tu carril no tiene nadador asignado', {
            duration: 3000,
            id: 'heat-start-no-swimmer'
          });
        }
      });

      // Escuchar cuando el admin reinicia (nueva serie)
      channel.bind('heat-reset', (data: any) => {
        console.log('🔄 Admin reinició la serie:', data);
        
        // Detener y resetear cronómetro local
        setLocalRunning(false);
        setLocalTime(0);
        localStartTimeRef.current = null;
        setRecordedTime(null);
        
        toast('🔄 Nueva serie - Cronómetro reiniciado', { duration: 2000 });
      });

      // Escuchar cuando el admin cambia de serie
      channel.bind('heat-changed', (data: any) => {
        console.log('📋 Admin cambió de serie:', data);
        toast.dismiss(); // Limpiar toasts anteriores
        toast(`📋 Serie ${data.heatNumber} - Esperando asignación de nadador`, { 
          duration: 4000,
          id: 'heat-changed' // ID único para evitar duplicados
        });
        
        // Reiniciar estados del cronómetro local
        setLocalRunning(false);
        setLocalTime(0);
        localStartTimeRef.current = null;
        setRecordedTime(null);
        
        // Limpiar datos del nadador anterior (no recargar desde BD porque Serie 2+ no existe ahí)
        if (lane) {
          setLane({
            ...lane,
            swimmer: undefined,
            finalTime: undefined
          });
        }
      });

      // Escuchar cuando el admin asigna nadadores
      channel.bind('swimmers-assigned', (data: any) => {
        console.log('👤 Evento swimmers-assigned recibido:', data);
        console.log('🔍 Mi laneId actual:', laneId);
        console.log('🔍 Mi número de carril:', lane?.lane);
        
        // Buscar asignación por laneId O por número de carril (para Series 2+)
        const myLaneAssignment = data.assignments?.find((a: any) => {
          const matchById = a.laneId === laneId;
          const matchByNumber = lane && a.laneNumber === lane.lane;
          console.log(`🔎 Comparando asignación - laneId: ${a.laneId} vs ${laneId} = ${matchById}, laneNumber: ${a.laneNumber} vs ${lane?.lane} = ${matchByNumber}`);
          return matchById || matchByNumber;
        });
        
        console.log('✅ Mi asignación encontrada:', myLaneAssignment);
        
        if (myLaneAssignment) {
          // SIEMPRE actualizar el estado con los datos del evento Pusher
          // No intentar buscar en BD porque Serie 2+ puede no existir ahí aún
          if (lane) {
            console.log('📝 Actualizando lane con nadador:', myLaneAssignment.swimmerName);
            setLane({
              ...lane,
              id: myLaneAssignment.laneId, // Actualizar al nuevo laneId de Serie 2+
              swimmer: myLaneAssignment.swimmerName ? {
                id: myLaneAssignment.swimmerId,
                name: myLaneAssignment.swimmerName.split(' ')[0] || myLaneAssignment.swimmerName,
                lastName: myLaneAssignment.swimmerName.split(' ').slice(1).join(' ') || '',
                birthDate: ''
              } : undefined,
              finalTime: undefined // Resetear tiempo de serie anterior
            });
          }
          
          // Mostrar notificación
          if (myLaneAssignment.swimmerName) {
            toast.dismiss();
            toast.success(`🏊 Nadador asignado: ${myLaneAssignment.swimmerName}`, { 
              duration: 5000,
              icon: '👤',
              id: `swimmer-assigned-${myLaneAssignment.laneId}`
            });
          }
        } else {
          console.log('❌ No se encontró asignación para este carril');
        }
      });

      // Escuchar cuando el admin finaliza el evento
      channel.bind('event-finished', (data: any) => {
        console.log('🏁 Evento finalizado por el administrador:', data);
        
        // Detener cronómetro si estaba corriendo
        setLocalRunning(false);
        
        // Mostrar notificación prominente
        toast.dismiss(); // Limpiar todos los toasts anteriores
        toast.success('🏁 EVENTO FINALIZADO', {
          duration: 3000,
          icon: '🎉',
          id: 'event-finished',
          style: {
            background: '#22c55e',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            padding: '20px',
          }
        });

        // Redirigir a competencias después de 3 segundos
        setTimeout(() => {
          toast.loading('Redirigiendo a competencias...', {
            duration: 1000,
            id: 'redirecting'
          });
          
          setTimeout(() => {
            router.push('/profesor/competencias');
          }, 1000);
        }, 3000);
      });
    }

    return () => {
      unsubscribeFromPusherChannel(channelName);
    };
  }, [eventId, laneId, fetchLaneData]);

  // Registrar tiempo cuando el nadador llega - DETIENE el cronómetro local
  const handleStopLane = async () => {
    if (!lane?.swimmer) {
      toast.error('No hay nadador asignado');
      return;
    }

    if (!localRunning) {
      toast.error('El cronómetro no está corriendo');
      return;
    }

    if (recordedTime !== null) {
      toast.error('Ya has registrado un tiempo para este nadador');
      return;
    }

    // DETENER cronómetro local y capturar tiempo exacto
    const exactStopTime = Date.now();
    const capturedTime = exactStopTime - localStartTimeRef.current!;
    
    // Detener cronómetro
    setLocalRunning(false);
    setRecordedTime(capturedTime);
    setLocalTime(capturedTime); // Congelar en el tiempo capturado
    
    toast.success(`⏱️ STOP - Tiempo: ${formatTime(capturedTime)}`, {
      duration: 5000,
      icon: '🏁'
    });

    // Guardar tiempo en la base de datos y notificar al admin
    try {
      const response = await fetch(`/api/club/lanes/${laneId}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalTime: capturedTime
        })
      });

      if (response.ok) {
        toast.success('✅ Tiempo enviado al administrador', {
          duration: 5000,
          icon: '📤'
        });

        // Notificar al admin con el tiempo final
        await fetch('/api/pusher/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `event-${eventId}`,
            event: 'lane-time-submitted',
            data: {
              laneId: lane.id,
              laneNumber: lane.laneNumber,
              finalTime: capturedTime,
              swimmerName: `${lane.swimmer?.name} ${lane.swimmer?.lastName}`,
              timestamp: Date.now()
            }
          })
        });

        // Mostrar mensaje de espera para la siguiente serie
        setTimeout(() => {
          toast('⏳ Esperando Serie 2...', {
            duration: 10000,
            icon: '🏊'
          });
        }, 2000);

      } else {
        toast.error('Error al guardar tiempo');
        // Si hubo error, permitir reenvío
        setRecordedTime(null);
        setLocalRunning(false);
      }
    } catch (error) {
      console.error('Error saving time:', error);
      toast.error('Error de conexión');
      // Si hubo error, permitir reenvío
      setRecordedTime(null);
      setLocalRunning(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!event || !lane) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron datos</p>
          <Link href="/profesor/competencias">
            <Button className="mt-4">Volver</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <Link 
            href="/profesor/competencias"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Volver a Competiciones
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                Control Carril {lane.laneNumber}
              </h1>
              <p className="text-sm sm:text-lg text-gray-600 mt-1 sm:mt-2">
                {event.title} • {event.distance}m {event.style}
              </p>
            </div>
            
            <Badge variant="default" className="text-base sm:text-xl px-4 py-2 sm:px-6 sm:py-3 w-fit">
              <Hash className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Carril {lane.laneNumber}
            </Badge>
          </div>
        </div>

        {/* Nadador Asignado */}
        <Card className="mb-4 sm:mb-8 border-2 border-blue-200">
          <CardHeader className="bg-blue-50 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Nadador Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {lane.swimmer ? (
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {lane.swimmer.name} {lane.swimmer.lastName}
                </p>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                  Fecha de nacimiento: {new Date(lane.swimmer.birthDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm sm:text-base">
                No hay nadador asignado en este carril
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cronómetro Local del Profesor */}
        <Card className={`mb-4 sm:mb-8 border-4 transition-all ${localRunning ? 'border-green-500 bg-green-50 shadow-lg shadow-green-200' : recordedTime !== null ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
          <CardHeader className={`p-3 sm:p-6 ${localRunning ? 'bg-green-100' : recordedTime !== null ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-sm sm:text-base">
              <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${localRunning ? 'text-green-600 animate-pulse' : recordedTime !== null ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={localRunning ? 'text-green-900' : recordedTime !== null ? 'text-blue-900' : 'text-gray-900'}>
                Tu Cronómetro - Carril {lane.laneNumber}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              <div className={`text-4xl sm:text-7xl font-mono font-bold mb-3 sm:mb-4 ${localRunning ? 'text-green-600' : recordedTime !== null ? 'text-blue-600' : 'text-gray-400'}`}>
                {formatTime(localTime)}
              </div>
              <Badge 
                variant={localRunning ? "default" : recordedTime !== null ? "default" : "secondary"} 
                className={`text-xs sm:text-lg px-3 py-1.5 sm:px-4 sm:py-2 ${localRunning ? 'bg-green-600 animate-pulse' : recordedTime !== null ? 'bg-blue-600' : ''}`}
              >
                {localRunning ? "⏱️ CORRIENDO - Presiona STOP cuando llegue" : recordedTime !== null ? "✅ TIEMPO REGISTRADO" : "⏸️ Esperando señal del administrador"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Control de Registro de Tiempo */}
        <Card className="mb-4 sm:mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 sm:p-6">
            <CardTitle className="text-center text-base sm:text-2xl">
              Registro de Tiempo - Carril {lane.laneNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              {recordedTime !== null ? (
                // Ya se registró un tiempo
                <div className="space-y-3 sm:space-y-6">
                  <div className="text-5xl sm:text-9xl font-mono font-bold text-blue-600 mb-2 sm:mb-4 tracking-wider">
                    {formatTime(recordedTime)}
                  </div>
                  <Badge variant="default" className="text-sm sm:text-2xl px-4 py-2 sm:px-8 sm:py-4 bg-blue-600">
                    ✅ Tiempo Enviado al Administrador
                  </Badge>
                  <p className="text-sm sm:text-lg text-gray-600 mt-2 sm:mt-4">
                    El administrador ha recibido el tiempo de este carril
                  </p>
                </div>
              ) : localRunning ? (
                // Cronómetro local corriendo - mostrar botón STOP
                <div className="space-y-3 sm:space-y-6">
                  <p className="text-base sm:text-xl text-gray-700 font-semibold mb-2 sm:mb-4">
                    👀 Observa tu cronómetro arriba
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStopLane}
                    disabled={!lane.swimmer}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 sm:px-16 sm:py-10 text-xl sm:text-3xl shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 disabled:opacity-50 animate-pulse w-full sm:w-auto"
                  >
                    <Square className="w-6 h-6 sm:w-10 sm:h-10 mr-2 sm:mr-4" />
                    STOP - Registrar Llegada
                  </Button>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-4">
                    🏁 Presiona cuando tu nadador toque la pared
                  </p>
                  {!lane.swimmer && (
                    <p className="text-red-600 font-semibold mt-1 sm:mt-2 text-xs sm:text-base">
                      ⚠️ No hay nadador asignado
                    </p>
                  )}
                </div>
              ) : (
                // Esperando que el admin inicie
                <div className="space-y-3 sm:space-y-6">
                  <Clock className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-400" />
                  <p className="text-base sm:text-xl text-gray-600">
                    Esperando que el administrador dé la señal de START...
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Tu cronómetro iniciará automáticamente
                  </p>
                  {!lane.swimmer && (
                    <p className="text-red-600 font-semibold text-xs sm:text-base">
                      ⚠️ No hay nadador asignado en este carril
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              📋 Cómo Funciona - Nueva Lógica
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-700 text-xs sm:text-base">
              <li>• <strong>El administrador da la señal de START</strong> cuando comienza la carrera</li>
              <li>• <strong>Tu cronómetro inicia automáticamente</strong> al recibir la señal</li>
              <li>• <strong>Observa a tu nadador</strong> y tu cronómetro (arriba)</li>
              <li>• <strong>Presiona STOP</strong> en el momento exacto que tu nadador toque la pared</li>
              <li>• <strong>El tiempo se detiene y se envía</strong> automáticamente al administrador</li>
              <li>• ✅ Cada profesor controla su propio cronómetro independientemente</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
