import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MEDIA_GALLERY_PRICE = 15; // S/15 por mes

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT', 'ADMIN']);

    const body = await request.json();
    const { enable } = body;

    if (typeof enable !== 'boolean') {
      return NextResponse.json(
        { error: 'El parámetro "enable" es requerido y debe ser booleano' },
        { status: 400 }
      );
    }

    // Obtener suscripción actual
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No se encontró suscripción activa' },
        { status: 404 }
      );
    }

    // Verificar si está intentando desactivar un add-on gratis (solo admin puede)
    if (!enable && subscription.mediaGalleryIsFree) {
      return NextResponse.json(
        { error: 'Este add-on fue activado por un administrador. Contacta con soporte para desactivarlo.' },
        { status: 403 }
      );
    }

    // Calcular nuevo monto de add-ons
    let newAddonsAmount = Number(subscription.addonsAmount);
    
    if (enable && !subscription.mediaGalleryAddon) {
      // Activando el add-on
      newAddonsAmount += MEDIA_GALLERY_PRICE;
    } else if (!enable && subscription.mediaGalleryAddon && !subscription.mediaGalleryIsFree) {
      // Desactivando el add-on (solo si no es gratis)
      newAddonsAmount -= MEDIA_GALLERY_PRICE;
    }

    // Actualizar suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        mediaGalleryAddon: enable,
        mediaGalleryIsFree: false, // Usuario está pagando, no es gratis
        addonsAmount: newAddonsAmount,
      },
    });

    // TODO: Actualizar suscripción en Culqi
    // Si tiene culqiSubscriptionId, actualizar el monto en Culqi
    // const newTotalAmount = Number(updatedSubscription.currentPrice) + newAddonsAmount;
    // await updateCulqiSubscription(updatedSubscription.culqiSubscriptionId, newTotalAmount);

    const totalAmount = Number(updatedSubscription.currentPrice) + Number(updatedSubscription.addonsAmount);

    return NextResponse.json({
      success: true,
      message: enable 
        ? `Add-on activado. Tu nueva mensualidad es S/${totalAmount.toFixed(2)}`
        : `Add-on desactivado. Tu nueva mensualidad es S/${totalAmount.toFixed(2)}`,
      subscription: {
        mediaGalleryAddon: updatedSubscription.mediaGalleryAddon,
        mediaGalleryIsFree: updatedSubscription.mediaGalleryIsFree,
        addonsAmount: Number(updatedSubscription.addonsAmount),
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Error toggling add-on:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el add-on' },
      { status: 500 }
    );
  }
}
