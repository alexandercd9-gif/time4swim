import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { user } = await requireAuth(request, ['CLUB']);
    
    // Obtener el club del usuario
    const userClub = await (prisma as any).userClub.findFirst({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        club: true
      }
    });

    if (!userClub) {
      return NextResponse.json(
        { error: 'Usuario no está asociado a ningún club' },
        { status: 404 }
      );
    }

    const clubId = userClub.clubId;

    // Obtener nadadores ASIGNADOS POR PADRES a este club
    const clubSwimmers = await (prisma as any).child.findMany({
      where: {
        clubId: clubId
      },
      include: {
        records: true,
        parents: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Calcular estadísticas del club
    const totalSwimmers = clubSwimmers.length;
    const totalTrainings = 0; // Temporalmente 0 hasta implementar trainings
    const totalRecords = clubSwimmers.reduce((sum: number, swimmer: any) => sum + swimmer.records.length, 0);
    
    // Competencias (records con competition)
    const totalCompetitions = clubSwimmers.reduce((sum: number, swimmer: any) => {
      return sum + swimmer.records.filter((record: any) => 
        record.competition && record.competition.trim() !== ''
      ).length;
    }, 0);

    // Entrenamientos este mes (temporalmente 0)
    const trainingsThisMonth = 0;

    // Records personales del club
    const personalBests = clubSwimmers.reduce((sum: number, swimmer: any) => {
      return sum + swimmer.records.filter((record: any) => record.isPersonalBest).length;
    }, 0);

    // Medallas obtenidas
    const medals = clubSwimmers.reduce((acc: any, swimmer: any) => {
      swimmer.records.forEach((record: any) => {
        if (record.medal) {
          acc[record.medal] = (acc[record.medal] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    // Información detallada de nadadores
    const swimmersDetails = clubSwimmers.map((swimmer: any) => ({
      id: swimmer.id,
      name: swimmer.name,
      age: new Date().getFullYear() - swimmer.birthDate.getFullYear(),
      trainings: 0, // Temporalmente 0
      records: swimmer.records.length,
      competitions: swimmer.records.filter((record: any) => 
        record.competition && record.competition.trim() !== ''
      ).length,
      personalBests: swimmer.records.filter((record: any) => record.isPersonalBest).length,
      parents: swimmer.parents.map((parent: any) => ({
        name: parent.user.name,
        email: parent.user.email
      }))
    }));

    return NextResponse.json({
      club: {
        id: userClub.club.id,
        name: userClub.club.name
      },
      swimmers: {
        total: totalSwimmers,
        details: swimmersDetails
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
      medals: {
        gold: medals.GOLD || 0,
        silver: medals.SILVER || 0,
        bronze: medals.BRONZE || 0,
        total: Object.values(medals).reduce((sum: number, count: any) => sum + (count as number), 0)
      },
      summary: {
        totalSwimmers,
        totalTrainings,
        totalCompetitions,
        totalRecords
      }
    });

  } catch (error) {
    console.error('Error getting club stats:', error);
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas del club' },
      { status: 500 }
    );
  }
}