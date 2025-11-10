"use client";

import { useState, useEffect, use, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Clock, User, Hash, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
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
        
        // Iniciar cronómetro LOCAL inmediatamente
        const startTime = Date.now();
        localStartTimeRef.current = startTime;
        setLocalTime(0);
        setLocalRunning(true);
        
        toast.success('🏁 ¡CARRERA INICIADA! Cronómetro en marcha', { 
          duration: 3000,
          icon: '🏊' 
        });
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
        toast(`📋 Cambiando a Serie ${data.heatNumber}`, { duration: 3000 });
        
        // Reiniciar estados del cronómetro local
        setLocalRunning(false);
        setLocalTime(0);
        localStartTimeRef.current = null;
        setRecordedTime(null);
      });

      // Escuchar cuando el admin asigna nadadores
      channel.bind('swimmers-assigned', (data: any) => {
        console.log('👤 Nadadores asignados:', data);
        
        // Buscar si hay asignación para este carril
        const myLaneAssignment = data.assignments?.find((a: any) => a.laneId === laneId);
        
        if (myLaneAssignment) {
          if (myLaneAssignment.swimmerName) {
            toast.success(`🏊 Nadador asignado: ${myLaneAssignment.swimmerName}`, { 
              duration: 5000,
              icon: '👤'
            });
          }
          // Recargar datos del carril para actualizar la UI
          fetchLaneData();
        }
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
        toast.success('✅ Tiempo guardado y enviado al administrador');

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
      } else {
        toast.error('Error al guardar tiempo');
      }
    } catch (error) {
      console.error('Error saving time:', error);
      toast.error('Error de conexión');
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profesor/competencias"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Competiciones
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                Control de Carril {lane.laneNumber}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                {event.title} • {event.distance}m {event.style}
              </p>
            </div>
            
            <Badge variant="default" className="text-xl px-6 py-3">
              <Hash className="w-5 h-5 mr-2" />
              Carril {lane.laneNumber}
            </Badge>
          </div>
        </div>

        {/* Nadador Asignado */}
        <Card className="mb-8 border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Nadador Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {lane.swimmer ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {lane.swimmer.name} {lane.swimmer.lastName}
                </p>
                <p className="text-gray-600 mt-2">
                  Fecha de nacimiento: {new Date(lane.swimmer.birthDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No hay nadador asignado en este carril
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cronómetro Local del Profesor */}
        <Card className={`mb-8 border-4 transition-all ${localRunning ? 'border-green-500 bg-green-50 shadow-lg shadow-green-200' : recordedTime !== null ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
          <CardHeader className={localRunning ? 'bg-green-100' : recordedTime !== null ? 'bg-blue-100' : 'bg-gray-50'}>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Clock className={`w-6 h-6 ${localRunning ? 'text-green-600 animate-pulse' : recordedTime !== null ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={localRunning ? 'text-green-900' : recordedTime !== null ? 'text-blue-900' : 'text-gray-900'}>
                Tu Cronómetro - Carril {lane.laneNumber}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center">
              <div className={`text-7xl font-mono font-bold mb-4 ${localRunning ? 'text-green-600' : recordedTime !== null ? 'text-blue-600' : 'text-gray-400'}`}>
                {formatTime(localTime)}
              </div>
              <Badge 
                variant={localRunning ? "default" : recordedTime !== null ? "default" : "secondary"} 
                className={`text-lg px-4 py-2 ${localRunning ? 'bg-green-600 animate-pulse' : recordedTime !== null ? 'bg-blue-600' : ''}`}
              >
                {localRunning ? "⏱️ CORRIENDO - Presiona STOP cuando llegue" : recordedTime !== null ? "✅ TIEMPO REGISTRADO" : "⏸️ Esperando señal del administrador"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Control de Registro de Tiempo */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-center text-2xl">
              Registro de Tiempo - Carril {lane.laneNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center">
              {recordedTime !== null ? (
                // Ya se registró un tiempo
                <div className="space-y-6">
                  <div className="text-9xl font-mono font-bold text-blue-600 mb-4 tracking-wider">
                    {formatTime(recordedTime)}
                  </div>
                  <Badge variant="default" className="text-2xl px-8 py-4 bg-blue-600">
                    ✅ Tiempo Enviado al Administrador
                  </Badge>
                  <p className="text-lg text-gray-600 mt-4">
                    El administrador ha recibido el tiempo de este carril
                  </p>
                </div>
              ) : localRunning ? (
                // Cronómetro local corriendo - mostrar botón STOP
                <div className="space-y-6">
                  <p className="text-xl text-gray-700 font-semibold mb-4">
                    👀 Observa tu cronómetro arriba
                  </p>
                  <Button
                    size="lg"
                    onClick={handleStopLane}
                    disabled={!lane.swimmer}
                    className="bg-red-600 hover:bg-red-700 text-white px-16 py-10 text-3xl shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 disabled:opacity-50 animate-pulse"
                  >
                    <Square className="w-10 h-10 mr-4" />
                    STOP - Registrar Llegada
                  </Button>
                  <p className="text-sm text-gray-600 mt-4">
                    🏁 Presiona cuando tu nadador toque la pared
                  </p>
                  {!lane.swimmer && (
                    <p className="text-red-600 font-semibold mt-2">
                      ⚠️ No hay nadador asignado
                    </p>
                  )}
                </div>
              ) : (
                // Esperando que el admin inicie
                <div className="space-y-6">
                  <Clock className="w-24 h-24 mx-auto text-gray-400" />
                  <p className="text-xl text-gray-600">
                    Esperando que el administrador dé la señal de START...
                  </p>
                  <p className="text-sm text-gray-500">
                    Tu cronómetro iniciará automáticamente
                  </p>
                  {!lane.swimmer && (
                    <p className="text-red-600 font-semibold">
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
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              📋 Cómo Funciona - Nueva Lógica
            </h3>
            <ul className="space-y-2 text-gray-700">
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
