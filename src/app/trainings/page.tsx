"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Activity } from "lucide-react";
import Link from "next/link";

interface Training {
  id: string;
  style: string;
  distance: number;
  time: number;
  notes: string | null;
  date: string;
  child: {
    name: string;
    club: string | null;
  };
}

const styleLabels: Record<string, string> = {
  FREESTYLE: "🏊 Libre",
  BACKSTROKE: "🏊 Espalda",
  BREASTSTROKE: "🏊 Pecho",
  BUTTERFLY: "🦋 Mariposa",
  INDIVIDUAL_MEDLEY: "🎯 Combinado Individual"
};

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await fetch('/api/trainings');
        if (response.ok) {
          const data = await response.json();
          setTrainings(data.trainings);
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando entrenamientos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al cronómetro
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 Entrenamientos Guardados
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Historial de sesiones de entrenamiento
            </p>
          </div>
        </div>

        {trainings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No hay entrenamientos aún</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Usa el cronómetro para registrar tu primer entrenamiento
              </p>
              <Link href="/">
                <Button>
                  Ir al cronómetro
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{training.child.name}</h3>
                        {training.child.club && (
                          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {training.child.club}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Estilo:</span>
                          <p className="font-medium">{styleLabels[training.style] || training.style}</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Distancia:</span>
                          <p className="font-medium">{training.distance}m</p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Tiempo:</span>
                          <p className="font-mono font-bold text-blue-600 text-lg">
                            {formatTime(training.time)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <p className="font-medium">{formatDate(training.date)}</p>
                        </div>
                      </div>
                      
                      {training.notes && (
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Notas:</span>
                          <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">
                            {training.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}