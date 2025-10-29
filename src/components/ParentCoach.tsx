'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Target,
  Star,
  Clock,
  Trophy,
  BookOpen,
  Users,
  Calendar,
  Award,
  Lightbulb,
  ChevronRight,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SwimmerInsight {
  swimmerId: string;
  swimmerName: string;
  age: number;
  insights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    motivation: string[];
    goals: string[];
  };
  aiAnalysis: {
    performanceLevel: 'beginner' | 'intermediate' | 'advanced';
    consistency: 'low' | 'medium' | 'high';
    potential: 'developing' | 'promising' | 'exceptional';
    focusAreas: string[];
  };
}

interface ParentCoachProps {
  showFullInterface?: boolean;
}

const ParentCoach: React.FC<ParentCoachProps> = ({ 
  showFullInterface = false 
}) => {
  const [swimmers, setSwimmers] = useState<any[]>([]);
  const [insights, setInsights] = useState<SwimmerInsight[]>([]);
  const [selectedSwimmer, setSelectedSwimmer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [tipOfTheDay, setTipOfTheDay] = useState<string>('');

  useEffect(() => {
    loadSwimmersAndInsights();
    generateTipOfTheDay();
  }, []);

  const loadSwimmersAndInsights = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos de nadadores
      const mockSwimmers = [
        {
          id: '1',
          firstName: 'Sofia',
          lastName: 'Rodriguez',
          birthDate: '2010-03-15',
          trainingSessions: 24,
          personalBests: 5,
          lastTraining: '2024-10-25'
        },
        {
          id: '2',
          firstName: 'Diego',
          lastName: 'Rodriguez',
          birthDate: '2012-07-22',
          trainingSessions: 18,
          personalBests: 3,
          lastTraining: '2024-10-23'
        }
      ];

      setSwimmers(mockSwimmers);

      // Generar insights con IA simulada
      const generatedInsights = mockSwimmers.map(swimmer => 
        generateSwimmerInsights(swimmer)
      );

      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Error al cargar análisis');
    } finally {
      setLoading(false);
    }
  };

  const generateSwimmerInsights = (swimmer: any): SwimmerInsight => {
    const age = new Date().getFullYear() - new Date(swimmer.birthDate).getFullYear();
    
    // Análisis basado en datos simulados
    const performanceLevel = swimmer.personalBests > 4 ? 'advanced' : 
                            swimmer.personalBests > 2 ? 'intermediate' : 'beginner';
    
    const consistency = swimmer.trainingSessions > 20 ? 'high' :
                       swimmer.trainingSessions > 10 ? 'medium' : 'low';
    
    // Generar recomendaciones personalizadas
    const insights = {
      strengths: [],
      improvements: [],
      recommendations: [],
      motivation: [],
      goals: []
    } as SwimmerInsight['insights'];

    // Fortalezas basadas en el rendimiento
    if (performanceLevel === 'advanced') {
      insights.strengths.push('🏆 Excelente técnica para su edad');
      insights.strengths.push('⏱️ Tiempos consistentes y competitivos');
    } else if (performanceLevel === 'intermediate') {
      insights.strengths.push('📈 Progreso constante y sostenido');
      insights.strengths.push('🎯 Buena dedicación al entrenamiento');
    } else {
      insights.strengths.push('🌟 Gran potencial por desarrollar');
      insights.strengths.push('💪 Actitud positiva hacia el aprendizaje');
    }

    if (consistency === 'high') {
      insights.strengths.push('🔥 Excelente constancia en entrenamientos');
    }

    // Áreas de mejora
    if (consistency === 'low') {
      insights.improvements.push('📅 Aumentar frecuencia de entrenamientos');
      insights.improvements.push('⏰ Establecer rutina más regular');
    }

    if (age < 12) {
      insights.improvements.push('🏊‍♀️ Desarrollar técnica básica de todos los estilos');
      insights.improvements.push('🎮 Hacer que el entrenamiento sea más divertido');
    } else {
      insights.improvements.push('💯 Enfocarse en perfeccionar técnica específica');
      insights.improvements.push('🏅 Considerar competencias locales');
    }

    // Recomendaciones específicas
    insights.recommendations.push('🏊‍♂️ Practicar 2-3 estilos diferentes por sesión');
    insights.recommendations.push('📝 Llevar registro de progreso semanal');
    insights.recommendations.push('🍎 Mantener hidratación y nutrición adecuada');
    
    if (age > 10) {
      insights.recommendations.push('🎯 Establecer metas específicas para cada mes');
    }

    // Motivación personalizada
    insights.motivation.push('🌟 Celebrar cada pequeño logro y mejora');
    insights.motivation.push('👨‍👩‍👧‍👦 Asistir a entrenamientos cuando sea posible');
    insights.motivation.push('📸 Documentar el progreso con fotos y videos');

    if (performanceLevel === 'beginner') {
      insights.motivation.push('🎉 Enfocarse en la diversión, no solo en resultados');
    } else {
      insights.motivation.push('🏆 Reconocer el esfuerzo y dedicación mostrada');
    }

    // Metas sugeridas
    if (age < 10) {
      insights.goals.push('🏊‍♀️ Dominar técnica básica de crol y espalda');
      insights.goals.push('⏱️ Nadar 25m sin parar');
    } else if (age < 14) {
      insights.goals.push('🦋 Aprender mariposa y pecho correctamente');
      insights.goals.push('🏁 Participar en competencia escolar');
    } else {
      insights.goals.push('📊 Mejorar tiempos personales en 2 eventos');
      insights.goals.push('🏅 Competir a nivel regional');
    }

    return {
      swimmerId: swimmer.id,
      swimmerName: `${swimmer.firstName} ${swimmer.lastName}`,
      age,
      insights,
      aiAnalysis: {
        performanceLevel,
        consistency,
        potential: performanceLevel === 'advanced' ? 'exceptional' : 
                  performanceLevel === 'intermediate' ? 'promising' : 'developing',
        focusAreas: ['Técnica', 'Resistencia', 'Motivación', 'Competencia']
      }
    };
  };

  const generateTipOfTheDay = () => {
    const tips = [
      '💧 La hidratación es clave: asegúrate de que tu nadador beba agua antes, durante y después del entrenamiento.',
      '🏊‍♀️ La técnica es más importante que la velocidad en las primeras etapas del aprendizaje.',
      '🎯 Establece metas pequeñas y alcanzables para mantener la motivación alta.',
      '😴 Un buen descanso es tan importante como un buen entrenamiento para el rendimiento.',
      '🍎 Una alimentación balanceada ayuda a mejorar el rendimiento y la recuperación.',
      '📹 Grabar entrenamientos ocasionalmente ayuda a identificar áreas de mejora.',
      '🎉 Celebra todos los logros, por pequeños que sean, para mantener la motivación.',
      '⏰ La consistencia en horarios de entrenamiento ayuda a crear buenos hábitos.',
      '👥 Entrenar con amigos hace que la natación sea más divertida y motivadora.',
      '🏆 El proceso es más importante que los resultados inmediatos.'
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTipOfTheDay(randomTip);
  };

  const getPerformanceBadge = (level: string) => {
    const badges = {
      beginner: { label: '🌱 Aprendiendo', color: 'bg-green-100 text-green-800' },
      intermediate: { label: '📈 Progresando', color: 'bg-blue-100 text-blue-800' },
      advanced: { label: '⭐ Avanzado', color: 'bg-purple-100 text-purple-800' }
    };

    const badge = badges[level as keyof typeof badges];
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getConsistencyIcon = (consistency: string) => {
    switch (consistency) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💤';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Analizando datos de tus nadadores...</p>
        </CardContent>
      </Card>
    );
  }

  // Versión compacta para dashboard
  if (!showFullInterface) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Asistente para Padres
            </span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/parent-coach">
                Ver todo
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consejo del día */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">💡 Consejo del día</h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  {tipOfTheDay}
                </p>
              </div>
            </div>
          </div>

          {/* Insights rápidos */}
          {insights.slice(0, 1).map((insight) => (
            <div key={insight.swimmerId} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">{insight.swimmerName}</h4>
                {getPerformanceBadge(insight.aiAnalysis.performanceLevel)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Trophy className="h-4 w-4" />
                  <span>{insight.insights.strengths[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <Target className="h-4 w-4" />
                  <span>{insight.insights.recommendations[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Interfaz completa
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                🧠 Asistente Inteligente para Padres
              </CardTitle>
              <p className="text-purple-100 text-lg">
                Consejos personalizados basados en análisis de datos de tus nadadores
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 border border-white/20 mt-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 mt-0.5 text-purple-200" />
              <div className="text-sm text-purple-100">
                <p className="font-medium mb-1">🤖 ¿Cómo funciona?</p>
                <p>Nuestro asistente analiza los datos de entrenamiento, progreso y edad de tus hijos para darte 
                consejos específicos sobre técnica, motivación, metas y desarrollo deportivo.</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Consejo del día destacado */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 text-lg mb-2">
                💡 Consejo del día para padres
              </h3>
              <p className="text-yellow-800 leading-relaxed">
                {tipOfTheDay}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-yellow-700 hover:bg-yellow-200"
                onClick={generateTipOfTheDay}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Nuevo consejo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por nadador */}
      {insights.map((insight) => (
        <Card key={insight.swimmerId} className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {insight.swimmerName.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-xl">{insight.swimmerName}</CardTitle>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">{insight.age} años</span>
                    {getPerformanceBadge(insight.aiAnalysis.performanceLevel)}
                    <span className="text-sm flex items-center gap-1">
                      {getConsistencyIcon(insight.aiAnalysis.consistency)}
                      Constancia {insight.aiAnalysis.consistency === 'high' ? 'Alta' : 
                                insight.aiAnalysis.consistency === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Fortalezas */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Fortalezas
                </h4>
                <div className="space-y-2">
                  {insight.insights.strengths.map((strength, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recomendaciones
                </h4>
                <div className="space-y-2">
                  {insight.insights.recommendations.map((rec, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivación */}
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Motivación
                </h4>
                <div className="space-y-2">
                  {insight.insights.motivation.map((tip, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metas sugeridas */}
              <div className="md:col-span-2 lg:col-span-3">
                <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4" />
                  Metas sugeridas para los próximos 3 meses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insight.insights.goals.map((goal, index) => (
                    <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recursos adicionales */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            📚 Recursos para Padres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center">
              <Trophy className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-semibold text-indigo-900 mb-2">Competencias</h4>
              <p className="text-sm text-indigo-700 mb-3">
                Guía sobre cuándo y cómo introducir competencias
              </p>
              <Button size="sm" variant="ghost" className="text-indigo-600">
                Leer más
              </Button>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900 mb-2">Motivación</h4>
              <p className="text-sm text-green-700 mb-3">
                Técnicas para mantener el interés y la pasión
              </p>
              <Button size="sm" variant="ghost" className="text-green-600">
                Leer más
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900 mb-2">Rutinas</h4>
              <p className="text-sm text-blue-700 mb-3">
                Cómo establecer rutinas efectivas de entrenamiento
              </p>
              <Button size="sm" variant="ghost" className="text-blue-600">
                Leer más
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentCoach;