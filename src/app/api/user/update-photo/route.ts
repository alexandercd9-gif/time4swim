import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Autenticar usuario
    const authResult = await requireAuth(request, ['PARENT', 'TEACHER', 'CLUB', 'ADMIN']);
    const userId = authResult.user.id;
    const body = await request.json();
    const { photo } = body;

    if (!photo) {
      return NextResponse.json(
        { success: false, message: 'Foto no proporcionada' },
        { status: 400 }
      );
    }

    // Validar que sea base64
    if (!photo.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, message: 'Formato de imagen inválido' },
        { status: 400 }
      );
    }

    // Actualizar la foto en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photo }
    });

    return NextResponse.json({
      success: true,
      message: 'Foto actualizada correctamente'
    });

  } catch (error) {
    console.error('Error updating profile photo:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error al actualizar la foto' },
      { status: 500 }
    );
  }
}

// Endpoint para eliminar la foto
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['PARENT', 'TEACHER', 'CLUB', 'ADMIN']);
    const userId = authResult.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: null }
    });

    return NextResponse.json({
      success: true,
      message: 'Foto eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting profile photo:', error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
