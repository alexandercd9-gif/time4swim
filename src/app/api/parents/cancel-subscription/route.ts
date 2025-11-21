import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);

    // Obtener suscripción actual
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa' },
        { status: 404 }
      );
    }

    // Verificar que no esté ya cancelada
    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'La suscripción ya está cancelada' },
        { status: 400 }
      );
    }

    // Cancelar suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    });

    // TODO: Cancelar en Culqi también
    // if (subscription.culqiSubscriptionId) {
    //   await culqi.subscriptions.cancel(subscription.culqiSubscriptionId);
    // }

    // Actualizar estado del usuario a SUSPENDED
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'SUSPENDED'
      }
    });

    return NextResponse.json({
      message: 'Suscripción cancelada exitosamente',
      subscription: {
        status: updatedSubscription.status,
        canceledAt: updatedSubscription.canceledAt,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}
