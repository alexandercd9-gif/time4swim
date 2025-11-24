import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

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
    const isPersonalBest = otherRecords.length === 0 || newTime < otherRecords[0].time;

    // Si era récord personal y ya no lo es, o viceversa, actualizar accordingly
    if (isPersonalBest) {
      // Quitar récord personal a otros registros de la misma categoría
      await prisma.record.updateMany({
        where: {
          childId: existingRecord.childId,
          style: style,
          distance: parseInt(distance),
          poolSize: poolSize,
          isPersonalBest: true,
          id: { not: id }
        },
        data: {
          isPersonalBest: false
        }
      });
    } else if (existingRecord.isPersonalBest) {
      // Si el registro actual era récord y ya no lo será, 
      // encontrar el nuevo récord y marcarlo
      const newBest = await prisma.record.findFirst({
        where: {
          childId: existingRecord.childId,
          style: style,
          distance: parseInt(distance),
          poolSize: poolSize,
          id: { not: id }
        },
        orderBy: {
          time: 'asc'
        }
      });

      if (newBest) {
        await prisma.record.update({
          where: { id: newBest.id },
          data: { isPersonalBest: true }
        });
      }
    }

    // Actualizar el registro
    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        style,
        poolSize,
        competition,
        date: new Date(date),
        distance: parseInt(distance),
        time: newTime,
        position: position ? parseInt(position) : null,
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

    // Si el registro que se elimina era récord personal,
    // encontrar el siguiente mejor tiempo y marcarlo como récord
    if (existingRecord.isPersonalBest) {
      const nextBest = await prisma.record.findFirst({
        where: {
          childId: existingRecord.childId,
          style: existingRecord.style,
          distance: existingRecord.distance,
          poolSize: existingRecord.poolSize,
          id: { not: id }
        },
        orderBy: {
          time: 'asc'
        }
      });

      if (nextBest) {
        await prisma.record.update({
          where: { id: nextBest.id },
          data: { isPersonalBest: true }
        });
      }
    }

    // Eliminar el registro
    await prisma.record.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting competition record:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}