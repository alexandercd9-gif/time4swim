import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET: Obtener registros de competencias
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Obtener usuario para verificar role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let records;

    // Si es ADMIN, puede ver todas las competencias
    // Si es PARENT, solo ve las competencias de sus hijos
    if (user.role === 'ADMIN') {
      records = await prisma.record.findMany({
        include: {
          child: {
            select: {
              id: true,
              name: true,
              birthDate: true,
              gender: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    } else {
      // Obtener hijos del padre a través de UserChild
      const userChildren = await (prisma as any).userChild.findMany({
        where: { 
          userId: decoded.userId,
          isActive: true
        },
        select: { childId: true }
      });

      const childIds = userChildren.map((uc: any) => uc.childId);

      records = await prisma.record.findMany({
        where: {
          childId: { in: childIds }
        },
        include: {
          child: {
            select: {
              id: true,
              name: true,
              birthDate: true,
              gender: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo registro de competencia
export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const body = await request.json();
    const { 
      childId, 
      style, 
      poolSize, 
      competition, 
      date, 
      distance: distanceStr, 
      time: timeStr, 
      position: positionStr,
      medal,
      notes 
    } = body;

    // Convertir strings a números
    const distance = parseInt(distanceStr);
    const time = parseFloat(timeStr);
    const position = positionStr ? parseInt(positionStr) : null;

    console.log('📝 Datos de competencia recibidos:', {
      childId,
      style,
      poolSize,
      competition,
      date,
      distance: `${distanceStr} -> ${distance}`,
      time: `${timeStr} -> ${time}`,
      position: positionStr ? `${positionStr} -> ${position}` : null,
      medal,
      notes
    });

    // Validaciones de conversión
    if (isNaN(distance) || distance <= 0) {
      return NextResponse.json(
        { message: 'La distancia debe ser un número válido mayor a 0' },
        { status: 400 }
      );
    }

    if (isNaN(time) || time <= 0) {
      return NextResponse.json(
        { message: 'El tiempo debe ser un número válido mayor a 0' },
        { status: 400 }
      );
    }

    // Validaciones básicas
    if (!childId || !style || !poolSize || !competition || !date || !distance || !time) {
      return NextResponse.json(
        { message: 'Todos los campos requeridos deben ser completados' },
        { status: 400 }
      );
    }

    // Verificar que el nadador existe y pertenece al usuario (si no es admin)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return NextResponse.json(
        { message: 'Nadador no encontrado' },
        { status: 404 }
      );
    }

    // Si no es admin, verificar que el nadador le pertenece
    if (user.role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userChild.findFirst({
        where: {
          userId: decoded.userId,
          childId: childId,
          isActive: true
        }
      });

      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No tienes permiso para registrar competencias para este nadador' },
          { status: 403 }
        );
      }
    }

    // Verificar si es récord personal
    const existingRecords = await prisma.record.findMany({
      where: {
        childId: childId,
        style: style,
        distance: distance,
        poolSize: poolSize
      },
      orderBy: {
        time: 'asc'
      },
      take: 1
    });

    const isPersonalBest = existingRecords.length === 0 || time < existingRecords[0].time;

    // Si es récord personal, actualizar records anteriores
    if (isPersonalBest && existingRecords.length > 0) {
      await prisma.record.updateMany({
        where: {
          childId: childId,
          style: style,
          distance: distance,
          poolSize: poolSize,
          isPersonalBest: true
        },
        data: {
          isPersonalBest: false
        }
      });
    }

    console.log('🏊 Creando registro de competencia:', {
      childId,
      style,
      poolSize,
      competition,
      date: new Date(date),
      distance,
      time,
      position,
      medal: medal || null,
      notes: notes || null,
      isPersonalBest
    });

    // Crear registro de competencia
    const record = await prisma.record.create({
      data: {
        childId,
        style,
        poolSize,
        competition,
        date: new Date(date),
        distance,
        time,
        position,
        medal: medal || null,
        notes: notes || null,
        isPersonalBest
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true
          }
        }
      }
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating competition record:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}