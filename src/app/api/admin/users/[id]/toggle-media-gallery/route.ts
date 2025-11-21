import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, ['ADMIN']);
    
    const { id } = await params;
    
    const body = await request.json();
    const { enableMediaGallery } = body;

    if (typeof enableMediaGallery !== 'boolean') {
      return NextResponse.json(
        { error: 'El parámetro "enableMediaGallery" es requerido y debe ser booleano' },
        { status: 400 }
      );
    }

    // Buscar usuario con su suscripción
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!user.subscription) {
      return NextResponse.json(
        { error: 'El usuario no tiene una suscripción activa' },
        { status: 400 }
      );
    }

    // Actualizar add-on (gratis, sin cobro)
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        mediaGalleryAddon: enableMediaGallery,
        mediaGalleryIsFree: enableMediaGallery, // Marcado como gratis
        addonsAmount: 0, // No cobrar si es gratis
      }
    });

    return NextResponse.json({
      success: true,
      message: enableMediaGallery 
        ? 'Galería de Medios activada GRATIS para el usuario'
        : 'Galería de Medios desactivada para el usuario'
    });
  } catch (error) {
    console.error('Error toggling media gallery for user:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el add-on' },
      { status: 500 }
    );
  }
}
