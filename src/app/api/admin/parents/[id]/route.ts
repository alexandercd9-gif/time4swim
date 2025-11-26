import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// PUT: Editar padre
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, parentType } = body;

    // Verificar si el padre existe
    const existingParent = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingParent) {
      return NextResponse.json(
        { message: 'Padre no encontrado' },
        { status: 404 }
      );
    }

    if ((existingParent as any).role !== 'PARENT') {
      return NextResponse.json(
        { message: 'No se puede editar este usuario' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe (excepto el usuario actual)
    if (email && email !== existingParent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (parentType !== undefined) updateData.parentType = parentType || null;
    
    // Solo hashear la contraseña si se proporciona una nueva
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar padre
    const updatedParent = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            userchild: true
          }
        }
      }
    });

    const { _count, ...parentData } = updatedParent;
    
    const responsePayload = {
      ...parentData,
      children: _count.userchild
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error updating parent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar padre
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si el padre existe
    const parent = await prisma.user.findUnique({
      where: { id },
      include: {
        userchild: true
      }
    });

    if (!parent) {
      return NextResponse.json(
        { message: 'Padre no encontrado' },
        { status: 404 }
      );
    }

    if ((parent as any).role !== 'PARENT') {
      return NextResponse.json(
        { message: 'No se puede eliminar este usuario' },
        { status: 400 }
      );
    }

    // Eliminar padre (y sus hijos por cascada)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Padre eliminado exitosamente' }
    );
  } catch (error) {
    console.error('Error deleting parent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}