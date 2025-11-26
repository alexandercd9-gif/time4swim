import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { parseLocalDate } from "@/lib/dateUtils";

const prisma = new PrismaClient();

// PUT: Actualizar registro de competencia
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Obtener token de las cookies
    const token = request.cookies.get('token')?.value;

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
      style, 
      poolSize, 
      competition, 
      date, 
      distance, 
      time, 
      position,
      medal, 
      notes 
    } = body;

    // Verificar que el registro existe
    const existingRecord = await prisma.record.findUnique({
      where: { id },
      include: {
        child: true
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { message: 'Registro de competencia no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si no es admin, verificar que el nadador le pertenece
    if ((user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userchild.findFirst({
        where: {
          userId: decoded.userId,
          childId: existingRecord.childId,
          isActive: true
        }
      });
      
      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No tienes permiso para editar este registro' },
          { status: 403 }
        );
      }
    }

    // Verificar si el nuevo tiempo es récord personal
    const otherRecords = await prisma.record.findMany({
      where: {
        childId: existingRecord.childId,
        style: style,
        distance: parseInt(distance),
        poolSize: poolSize,
        id: { not: id } // Excluir el registro actual
      },
      orderBy: {
        time: 'asc'
      },
      take: 1
    });

    const newTime = parseFloat(time);

    // Actualizar el registro sin marcar como personal best aún
    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        style,
        poolSize,
        competition,
        date: parseLocalDate(date),
        distance: parseInt(distance),
        time: newTime,
        position: position ? parseInt(position) : null,
        medal: medal || null,
        notes: notes || null,
        isPersonalBest: false
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

    // Después de actualizar, recalcular el personal best para esta combinación
    // 1. Limpiar todos los personal bests de esta combinación
    await prisma.record.updateMany({
      where: {
        childId: existingRecord.childId,
        style: style,
        distance: parseInt(distance),
        poolSize: poolSize,
        isPersonalBest: true
      },
      data: {
        isPersonalBest: false
      }
    });

    // 2. Encontrar el tiempo más rápido de esta combinación
    const fastestRecord = await prisma.record.findFirst({
      where: {
        childId: existingRecord.childId,
        style: style,
        distance: parseInt(distance),
        poolSize: poolSize
      },
      orderBy: {
        time: 'asc'
      },
      select: {
        id: true
      }
    });

    // 3. Marcar solo el más rápido como personal best
    if (fastestRecord) {
      await prisma.record.update({
        where: {
          id: fastestRecord.id
        },
        data: {
          isPersonalBest: true
        }
      });
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating competition record:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar registro de competencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Obtener token de las cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Verificar que el registro existe
    const existingRecord = await prisma.record.findUnique({
      where: { id },
      include: {
        child: true
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { message: 'Registro de competencia no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si no es admin, verificar que el nadador le pertenece
    if ((user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userchild.findFirst({
        where: {
          userId: decoded.userId,
          childId: existingRecord.childId,
          isActive: true
        }
      });
      
      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No tienes permiso para eliminar este registro' },
          { status: 403 }
        );
      }
    }

    // Eliminar el registro
    await prisma.record.delete({
      where: { id }
    });

    // Después de eliminar, recalcular el personal best para esta combinación
    // 1. Limpiar todos los personal bests de esta combinación
    await prisma.record.updateMany({
      where: {
        childId: existingRecord.childId,
        style: existingRecord.style,
        distance: existingRecord.distance,
        poolSize: existingRecord.poolSize,
        isPersonalBest: true
      },
      data: {
        isPersonalBest: false
      }
    });

    // 2. Encontrar el tiempo más rápido restante
    const fastestRecord = await prisma.record.findFirst({
      where: {
        childId: existingRecord.childId,
        style: existingRecord.style,
        distance: existingRecord.distance,
        poolSize: existingRecord.poolSize
      },
      orderBy: {
        time: 'asc'
      },
      select: {
        id: true
      }
    });

    // 3. Marcar el más rápido como personal best
    if (fastestRecord) {
      await prisma.record.update({
        where: {
          id: fastestRecord.id
        },
        data: {
          isPersonalBest: true
        }
      });
    }

    return NextResponse.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting competition record:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}