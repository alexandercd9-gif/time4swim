import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET() {
  try {
    const trainings = await db.findMany('training', {
      include: {
        child: {
          select: {
            name: true,
            club: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ trainings });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json(
      { error: 'Error al obtener entrenamientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { swimmer, style, distance, time, notes, laps } = body;

    // Validar datos requeridos
    if (!swimmer || !style || !distance || !time) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Por ahora, crear un usuario y niño de prueba si no existen
    let user = await db.findFirst('user', {
      where: { email: 'demo@time4swim.com' }
    });

    if (!user) {
      user = await db.createUser({
        data: {
          name: 'Usuario Demo',
          email: 'demo@time4swim.com',
          password: 'demo123' // En producción esto debería estar hasheado
        }
      });
    }

    // Buscar el hijo a través de las relaciones UserChild
    const userChildRelation = await db.findFirst('userChild', {
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        child: {
          where: {
            name: swimmer
          }
        }
      }
    });

    let child = userChildRelation?.child;

    if (!child) {
      child = await db.createChild({
        data: {
          name: swimmer,
          birthDate: new Date('2010-01-01'), // Fecha de ejemplo
          gender: 'MALE' // Género de ejemplo
        }
      });
    }

    // Crear el entrenamiento
    const training = await db.createTraining({
      data: {
        style: style,
        distance: parseInt(distance),
        time: parseFloat(time),
        notes: notes || null,
        childId: child!.id,
        date: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      training: {
        id: training.id,
        swimmer: child!.name,
        style: training.style,
        distance: training.distance,
        time: training.time,
        notes: training.notes,
        date: training.date
      }
    });

  } catch (error) {
    console.error('Error saving training:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}