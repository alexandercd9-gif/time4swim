import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);
    
    // Obtener los hijos del padre
    const userChildren = await (prisma as any).userchild.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        child: {
          include: {
            record: true,
            club: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const children = userChildren.map((uc: any) => uc.child);
    
    // Calcular estadísticas familiares
    const totalChildren = children.length;
    const totalTrainings = 0; // Temporalmente 0 hasta implementar trainings
    const totalRecords = children.reduce((sum: number, child: any) => sum + child.record.length, 0);
    
    // Competencias (records con competition)
    const totalCompetitions = children.reduce((sum: number, child: any) => {
      return sum + child.record.filter((record: any) => record.competition && record.competition.trim() !== '').length;
    }, 0);

    // Entrenamientos este mes (temporalmente 0)
    const trainingsThisMonth = 0;

    // Records personales (marcados como personal best)
    const personalBests = children.reduce((sum: number, child: any) => {
      return sum + child.record.filter((record: any) => record.isPersonalBest).length;
    }, 0);

    // Información detallada de los hijos
    const childrenDetails = children.map((child: any) => ({
      id: child.id,
      name: child.name,
      club: child.club?.name || 'Sin club asignado',
      trainings: 0, // Temporalmente 0
      records: child.record.length,
      competitions: child.record.filter((record: any) => 
        record.competition && record.competition.trim() !== ''
      ).length,
      personalBests: child.record.filter((record: any) => record.isPersonalBest).length
    }));

    return NextResponse.json({
      children: {
        total: totalChildren,
        details: childrenDetails
      },
      trainings: {
        total: totalTrainings,
        thisMonth: trainingsThisMonth
      },
      competitions: {
        total: totalCompetitions
      },
      records: {
        total: totalRecords,
        personalBests: personalBests
      },
      summary: {
        totalChildren,
        totalTrainings,
        totalCompetitions,
        totalRecords
      }
    });

  } catch (error) {
    console.error('Error getting parent stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas del padre' },
      { status: 500 }
    );
  }
}