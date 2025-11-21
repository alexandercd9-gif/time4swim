import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);

    // Obtener usuario con suscripción
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: true,
      },
    });

    if (!userData || !userData.subscription) {
      return NextResponse.json(
        { error: 'No se encontró la suscripción' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene el add-on activado
    if (userData.subscription.mediaGalleryAddon) {
      return NextResponse.json(
        { error: 'El add-on ya está activado' },
        { status: 400 }
      );
    }

    // Activar el add-on y actualizar el monto de add-ons
    const currentAddonsAmount = Number(userData.subscription.addonsAmount) || 0;
    const newAddonsAmount = currentAddonsAmount + 15;

    const updatedSubscription = await prisma.subscription.update({
      where: { id: userData.subscription.id },
      data: {
        mediaGalleryAddon: true,
        mediaGalleryIsFree: false, // Es de pago
        addonsAmount: newAddonsAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Add-on activado correctamente',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error activating media gallery add-on:', error);
    return NextResponse.json(
      { error: 'Error al activar el add-on' },
      { status: 500 }
    );
  }
}
