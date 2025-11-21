import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);
    
    const { culqiToken } = await request.json();

    if (!culqiToken) {
      return NextResponse.json(
        { error: 'Token de Culqi requerido' },
        { status: 400 }
      );
    }

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

    // TODO: Actualizar tarjeta en Culqi
    // const culqiCard = await culqi.cards.create({
    //   customerId: subscription.culqiCustomerId,
    //   token: culqiToken
    // });

    // Por ahora solo actualizamos el token en la base de datos
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        culqiCardId: culqiToken // En producción sería el ID de la tarjeta
      }
    });

    return NextResponse.json({
      message: 'Método de pago actualizado exitosamente',
      cardLastFour: '****' // TODO: Obtener de Culqi
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Error al actualizar método de pago' },
      { status: 500 }
    );
  }
}
