import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['ADMIN']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, email, password, role } = body;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });

      if (emailInUse) {
        return NextResponse.json(
          { message: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {
      name,
      email,
      role
    };

    // Solo actualizar la contraseña si se proporciona una nueva
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isTrialAccount: true,
        trialExpiresAt: true,
        accountStatus: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request, ['ADMIN']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await context.params;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar administradores
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { message: 'No se puede eliminar un usuario administrador' },
        { status: 403 }
      );
    }

    // Eliminar usuario y todas sus relaciones en cascada
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
