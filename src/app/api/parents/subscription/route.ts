import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT', 'ADMIN']);

    // Obtener suscripción del usuario
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        plan: true,
        status: true,
        currentPrice: true,
        addonsAmount: true,
        mediaGalleryAddon: true,
        mediaGalleryIsFree: true,
        currentPeriodEnd: true,
        maxChildren: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No se encontró suscripción activa' },
        { status: 404 }
      );
    }

    // Calcular total a pagar (precio base + add-ons)
    const totalAmount = Number(subscription.currentPrice) + Number(subscription.addonsAmount);

    return NextResponse.json({
      subscription: {
        ...subscription,
        currentPrice: Number(subscription.currentPrice),
        addonsAmount: Number(subscription.addonsAmount),
        totalAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Error al obtener la suscripción' },
      { status: 500 }
    );
  }
}
