import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Obtener alertas para padres
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['PARENT', 'ADMIN']);
    
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    // Obtener hijos del usuario
    const userChildren = await (prisma as any).child.findMany({
      where: {
        userId: user.user.id,
        ...(childId ? { id: childId } : {})
      },
      include: {
        club: {
          select: {
            name: true
          }
        }
      }
    });

    const alerts = [];

    for (const child of userChildren) {
      // Verificar si hay datos FDPN recientes
      if (child.fdpnLastSync) {
        const daysSinceSync = Math.floor(
          (new Date().getTime() - new Date(child.fdpnLastSync).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceSync > 30) {
          alerts.push({
            id: `fdpn-sync-${child.id}`,
            type: 'info',
            priority: 'medium',
            title: '🔄 Actualización FDPN disponible',
            message: `Han pasado ${daysSinceSync} días desde la última sincronización con FDPN para ${child.firstName}. ¿Quieres buscar nuevos resultados?`,
            childId: child.id,
            childName: `${child.firstName} ${child.lastName}`,
            action: {
              type: 'sync_fdpn',
              label: 'Sincronizar ahora',
              url: `/dashboard/swimmers/${child.id}`
            },
            createdAt: new Date()
          });
        }
      } else {
        // Si nunca se ha sincronizado con FDPN
        alerts.push({
          id: `fdpn-first-${child.id}`,
          type: 'tip',
          priority: 'low',
          title: '⭐ ¿Sabías que...?',
          message: `Puedes buscar los tiempos oficiales de ${child.firstName} en la Federación Peruana de Natación. ¡Es gratis y te ayuda a seguir su progreso!`,
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          action: {
            type: 'discover_fdpn',
            label: 'Explorar FDPN',
            url: '/dashboard/fdpn'
          },
          createdAt: new Date()
        });
      }

      // Simular verificación de récords personales recientes
      // En un caso real, esto vendría de análisis de la base de datos
      const mockRecentPB = Math.random() > 0.7; // 30% de probabilidad
      if (mockRecentPB) {
        const events = ['50m Libre', '100m Libre', '50m Espalda'];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        alerts.push({
          id: `personal-best-${child.id}-${Date.now()}`,
          type: 'success',
          priority: 'high',
          title: '🏆 ¡Nuevo Récord Personal!',
          message: `¡Felicidades! ${child.firstName} ha establecido un nuevo récord personal en ${randomEvent}. ¡Sigue así!`,
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          action: {
            type: 'view_progress',
            label: 'Ver progreso',
            url: `/dashboard/swimmers/${child.id}`
          },
          createdAt: new Date()
        });
      }

      // Simulación de próximas competencias (esto vendría de un sistema de competencias real)
      const mockUpcomingCompetition = Math.random() > 0.8; // 20% de probabilidad
      if (mockUpcomingCompetition) {
        alerts.push({
          id: `competition-${child.id}-${Date.now()}`,
          type: 'reminder',
          priority: 'high',
          title: '📅 Competencia próxima',
          message: `${child.firstName} tiene una competencia el próximo fin de semana. ¡Recuerda preparar todo lo necesario!`,
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          action: {
            type: 'view_competitions',
            label: 'Ver detalles',
            url: '/dashboard/competitions'
          },
          createdAt: new Date()
        });
      }

      // Tips específicos según la actividad
      const inactivityDays = Math.floor(Math.random() * 15); // Simular días de inactividad
      if (inactivityDays > 7) {
        alerts.push({
          id: `motivation-${child.id}`,
          type: 'tip',
          priority: 'low',
          title: '💪 Mantener la motivación',
          message: `Han pasado ${inactivityDays} días sin entrenamientos registrados para ${child.firstName}. ¿Qué tal si registras la próxima sesión?`,
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          action: {
            type: 'add_training',
            label: 'Registrar entrenamiento',
            url: '/dashboard/timer'
          },
          createdAt: new Date()
        });
      }
    }

    // Ordenar por prioridad y fecha
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    alerts.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      alerts: alerts.slice(0, 10), // Limitar a 10 alertas más relevantes
      total: alerts.length,
      hasHighPriority: alerts.some(a => a.priority === 'high'),
      summary: {
        byType: {
          success: alerts.filter(a => a.type === 'success').length,
          info: alerts.filter(a => a.type === 'info').length,
          reminder: alerts.filter(a => a.type === 'reminder').length,
          tip: alerts.filter(a => a.type === 'tip').length
        },
        byPriority: {
          high: alerts.filter(a => a.priority === 'high').length,
          medium: alerts.filter(a => a.priority === 'medium').length,
          low: alerts.filter(a => a.priority === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Marcar alerta como leída o ejecutar acción
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['PARENT', 'ADMIN']);
    
    const { alertId, action } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { message: 'ID de alerta requerido' },
        { status: 400 }
      );
    }

    // En un sistema real, aquí guardarías el estado de las alertas leídas en la base de datos
    // Por ahora, solo confirmamos la acción

    let actionResult = null;

    if (action === 'sync_fdpn') {
      actionResult = {
        message: 'Redirigiendo a sincronización FDPN...',
        redirect: '/dashboard/fdpn'
      };
    } else if (action === 'view_progress') {
      actionResult = {
        message: 'Mostrando progreso del nadador...',
        redirect: '/dashboard/swimmers'
      };
    }

    return NextResponse.json({
      success: true,
      alertId,
      action,
      result: actionResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al procesar alerta:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}