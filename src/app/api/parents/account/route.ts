import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Force recompile - fixed userchild relation
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);

    // Obtener usuario con suscripción y pagos
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: {
          include: {
            payment: {
              orderBy: { createdAt: 'desc' },
              take: 12 // Últimos 12 pagos
            }
          }
        },
        userchild: {
          where: { isActive: true }, // Solo contar hijos activos
          select: { id: true, userId: true }
        }
      }
    }).catch((error) => {
      console.error('Error en Prisma query:', error);
      throw new Error(`Database query failed: ${error.message}`);
    });

    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const data = userData as any;

    // Contar hijos de forma segura
    const childrenCount = Array.isArray(data.userchild) ? data.userchild.length : 0;

    // Si no tiene suscripción, devolver datos de trial
    if (!data.subscription) {
      // Contar cuántos hijos tiene registrados actualmente

      return NextResponse.json({
        subscription: {
          plan: 'TRIAL',
          planName: 'Trial Gratuito',
          price: 0,
          status: 'TRIAL',
          currentPeriodEnd: data.trialExpiresAt,
          maxChildren: 3, // Trial permite hasta 3 nadadores
          childrenCount: childrenCount,
          cardLastFour: null,
          cardBrand: null,
          isTrialAccount: true
        },
        payments: []
      });
    }

    // Mapear plan a nombre legible
    const planNames: Record<string, string> = {
      PARENT_BASIC: 'Básico',
      PARENT_FAMILY: 'Familiar',
      PARENT_PREMIUM: 'Premium'
    };

    const sub = data.subscription;
    const payments = sub.payment || [];

    // Determinar información de tarjeta según el procesador
    let cardLastFour = null;
    let cardBrand = null;

    if (sub.processor === 'mercadopago' && sub.mercadopagoCardId) {
      // MercadoPago: el cardId ya contiene información, extraer los últimos 4
      cardLastFour = sub.mercadopagoCardId.toString().slice(-4);
      cardBrand = 'Tarjeta'; // MercadoPago no siempre devuelve el brand en el cardId
    } else if (sub.culqiCardId) {
      // Culqi
      cardLastFour = sub.culqiCardId.slice(-4);
      cardBrand = 'Visa'; // TODO: Obtener de Culqi
    }

    return NextResponse.json({
      subscription: {
        plan: sub.plan,
        planName: planNames[sub.plan] || sub.plan,
        price: Number(sub.currentPrice),
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        maxChildren: sub.maxChildren,
        childrenCount: childrenCount,
        cardLastFour: cardLastFour,
        cardBrand: cardBrand,
        processor: sub.processor || 'culqi',
        isTrialAccount: data.isTrialAccount,
        // Add-ons
        mediaGalleryAddon: sub.mediaGalleryAddon || false,
        mediaGalleryIsFree: sub.mediaGalleryIsFree || false,
        addonsAmount: Number(sub.addonsAmount || 0),
        totalAmount: Number(sub.currentPrice) + Number(sub.addonsAmount || 0)
      },
      payments: payments.map((payment: any) => ({
        id: payment.id,
        date: payment.paidAt || payment.createdAt,
        amount: Number(payment.amount),
        status: payment.status,
        plan: planNames[sub.plan] || sub.plan,
        receiptUrl: payment.receiptUrl,
        cardBrand: payment.cardBrand,
        cardLastFour: payment.cardLastFour
      }))
    });

  } catch (error: any) {
    console.error('Error fetching account data:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    return NextResponse.json(
      { 
        error: 'Error al obtener datos de la cuenta',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
