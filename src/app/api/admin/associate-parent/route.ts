import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Asociar padre con hijo
export async function POST(request: NextRequest) {
  try {
    const { childId, parentId } = await request.json();

    if (!childId || !parentId) {
      return NextResponse.json(
        { message: 'childId y parentId son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el hijo existe
    const child = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!child) {
      return NextResponse.json(
        { message: 'Hijo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el padre existe y es de rol PARENT
    const parent = await prisma.user.findUnique({
      where: { id: parentId }
    });

    if (!parent || parent.role !== 'PARENT') {
      return NextResponse.json(
        { message: 'Padre no encontrado o no es un usuario padre' },
        { status: 404 }
      );
    }

    // Verificar si la asociación ya existe
    const existingAssociation = await (prisma as any).userChild.findUnique({
      where: {
        userId_childId: {
          userId: parentId,
          childId: childId
        }
      }
    });

    if (existingAssociation) {
      // Si existe pero está inactiva, activarla
      if (!existingAssociation.isActive) {
        await (prisma as any).userChild.update({
          where: { id: existingAssociation.id },
          data: { isActive: true }
        });
        return NextResponse.json({ message: 'Asociación reactivada exitosamente' });
      } else {
        return NextResponse.json(
          { message: 'Esta asociación ya existe' },
          { status: 400 }
        );
      }
    }

    // Crear nueva asociación
    const association = await (prisma as any).userChild.create({
      data: {
        userId: parentId,
        childId: childId,
        isActive: true
      }
    });

    return NextResponse.json(association, { status: 201 });
  } catch (error) {
    console.error('Error creating association:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Desasociar padre de hijo
export async function DELETE(request: NextRequest) {
  try {
    const { childId, parentId } = await request.json();

    if (!childId || !parentId) {
      return NextResponse.json(
        { message: 'childId y parentId son requeridos' },
        { status: 400 }
      );
    }

    // Buscar la asociación
    const association = await (prisma as any).userChild.findUnique({
      where: {
        userId_childId: {
          userId: parentId,
          childId: childId
        }
      }
    });

    if (!association) {
      return NextResponse.json(
        { message: 'Asociación no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la asociación
    await (prisma as any).userChild.delete({
      where: { id: association.id }
    });

    return NextResponse.json({ message: 'Asociación eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting association:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}