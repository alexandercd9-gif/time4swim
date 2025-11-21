import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['PARENT']);

    // Obtener usuario con suscripción y pagos
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 12 // Últimos 12 pagos
            }
          }
        },
        children: {
          where: { isActive: true }, // Solo contar hijos activos
          select: { id: true }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const data = userData as any;

    // Si no tiene suscripción, devolver datos de trial
    if (!data.subscription) {
      // Contar cuántos hijos tiene registrados actualmente
      const childrenCount = data.children?.length || 0;
      
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
    const payments = sub.payments || [];

    return NextResponse.json({
      subscription: {
        plan: sub.plan,
        planName: planNames[sub.plan] || sub.plan,
        price: Number(sub.currentPrice),
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        maxChildren: sub.maxChildren,
        childrenCount: data.children?.length || 0,
        cardLastFour: sub.culqiCardId ? sub.culqiCardId.slice(-4) : null,
        cardBrand: 'Visa', // TODO: Obtener de Culqi
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

  } catch (error) {
    console.error('Error fetching account data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de la cuenta' },
      { status: 500 }
    );
  }
}
