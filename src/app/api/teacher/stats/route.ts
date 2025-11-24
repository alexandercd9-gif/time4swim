import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request, ['TEACHER']);
    
    // Obtener el club del profesor
    const teacherClub = await (prisma as any).userclub.findFirst({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        club: true
      }
    });

    if (!teacherClub) {
      return NextResponse.json(
        { error: 'Profesor no está asociado a ningún club' },
        { status: 404 }
      );
    }

    const clubId = teacherClub.clubId;

    // Obtener nadadores del club (asignados por padres)
    const clubSwimmers = await (prisma as any).child.findMany({
      where: {
        clubId: clubId
      },
      include: {
        records: true
      }
    });

    // Calcular estadísticas del club para el profesor
    const totalSwimmers = clubSwimmers.length;
    const totalTrainings = 0; // Temporalmente 0 hasta implementar trainings
    const totalRecords = clubSwimmers.reduce((sum: number, swimmer: any) => sum + swimmer.records.length, 0);
    
    // Entrenamientos este mes (temporalmente 0)
    const trainingsThisMonth = 0;

    // Records personales del club
    const personalBests = clubSwimmers.reduce((sum: number, swimmer: any) => {
      return sum + swimmer.records.filter((record: any) => record.isPersonalBest).length;
    }, 0);

    // Competencias (records con competition)
    const totalCompetitions = clubSwimmers.reduce((sum: number, swimmer: any) => {
      return sum + swimmer.records.filter((record: any) => 
        record.competition && record.competition.trim() !== ''
      ).length;
    }, 0);

    // Medallas del club
    const medals = clubSwimmers.reduce((acc: any, swimmer: any) => {
      swimmer.records.forEach((record: any) => {
        if (record.medal) {
          acc[record.medal] = (acc[record.medal] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    // Progreso reciente (temporalmente 0)
    const recentTrainings = 0;

    return NextResponse.json({
      club: {
        id: teacherClub.club.id,
        name: teacherClub.club.name
      },
      swimmers: {
        total: totalSwimmers
      },
      trainings: {
        total: totalTrainings,
        thisMonth: trainingsThisMonth,
        recent: recentTrainings
      },
      records: {
        total: totalRecords,
        personalBests: personalBests
      },
      competitions: {
        total: totalCompetitions
      },
      medals: {
        gold: medals.GOLD || 0,
        silver: medals.SILVER || 0,
        bronze: medals.BRONZE || 0,
        total: Object.values(medals).reduce((sum: number, count: any) => sum + (count as number), 0)
      },
      summary: {
        clubName: teacherClub.club.name,
        totalSwimmers,
        trainingsThisMonth,
        totalRecords,
        totalCompetitions
      }
    });

  } catch (error) {
    console.error('Error getting teacher stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas del profesor' },
      { status: 500 }
    );
  }
}