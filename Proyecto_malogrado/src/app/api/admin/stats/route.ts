import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request, ['ADMIN']);
    
    // Obtener estadísticas del sistema completo
    const [
      totalUsers,
      totalClubs,
      totalSwimmers,
      clubsWithUsers,
      newUsersThisMonth,
      newSwimmersThisMonth
    ] = await Promise.all([
      // Total de padres en el sistema (no todos los usuarios)
      prisma.user.count({
        where: {
          role: 'PARENT'
        }
      }),
      
      // Total de clubes registrados
      (prisma as any).club.count(),
      
      // Total de nadadores/niños en el sistema
      prisma.child.count(),
      
      // Clubes que tienen usuarios asignados a través de UserClub
      (prisma as any).club.count({
        where: {
          teachers: {
            some: {
              isActive: true // Solo contar relaciones activas
            }
          }
        }
      }),
      
      // Nuevos padres este mes (no todos los usuarios)
      prisma.user.count({
        where: {
          role: 'PARENT',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Nuevos nadadores este mes
      prisma.child.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    // Datos simulados para pagos pendientes (futura implementación)
    const pendingPayments = 8; // Simulado
    const overduePayments = 3; // Simulado

    // Obtener registros de padres por mes (últimos 6 meses)
    const monthlyRegistrations = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const parentsCount = await prisma.user.count({
        where: {
          role: 'PARENT',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      
      monthlyRegistrations.push({
        month: monthNames[date.getMonth()], // Usar el mes real de la fecha calculada
        parents: parentsCount
      });
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      },
      clubs: {
        total: totalClubs,
        active: clubsWithUsers
      },
      swimmers: {
        total: totalSwimmers,
        newThisMonth: newSwimmersThisMonth
      },
      activity: {
        newUsersThisMonth,
        newSwimmersThisMonth,
        monthlyGrowth: {
          users: newUsersThisMonth,
          swimmers: newSwimmersThisMonth
        }
      },
      payments: {
        pending: pendingPayments,
        overdue: overduePayments
      },
      monthlyRegistrations
    });

  } catch (error) {
    console.error('Error getting admin stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas del administrador' },
      { status: 500 }
    );
  }
}