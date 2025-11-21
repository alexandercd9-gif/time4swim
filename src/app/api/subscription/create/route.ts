import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createCustomer,
  createCard,
  createSubscription,
  CULQI_CONFIG,
} from '@/lib/culqi';
import { PaymentStatus } from '@prisma/client';

// Mapeo de planes a precios y límites
const PLAN_CONFIG = {
  basic: {
    plan: 'PARENT_BASIC',
    price: 15,
    maxChildren: 1,
    name: 'Plan Básico',
  },
  family: {
    plan: 'PARENT_FAMILY',
    price: 25,
    maxChildren: 3,
    name: 'Plan Familiar',
  },
  premium: {
    plan: 'PARENT_PREMIUM',
    price: 40,
    maxChildren: 6,
    name: 'Plan Premium',
  },
} as const;

// IDs de planes en Culqi (estos deben crearse en el dashboard de Culqi)
// TODO: Reemplazar con los IDs reales de tus planes en Culqi
const CULQI_PLAN_IDS = {
  basic: 'plan_basic_monthly',
  family: 'plan_family_monthly',
  premium: 'plan_premium_monthly',
};

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const user = await requireAuth(request, ['PARENT']);
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 2. Obtener datos del request
    const body = await request.json();
    const { planId, culqiToken } = body;

    // 3. Validar plan
    if (!planId || !PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG]) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    // 4. Validar token de Culqi
    if (!culqiToken) {
      return NextResponse.json(
        { error: 'Token de tarjeta requerido' },
        { status: 400 }
      );
    }

    const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];

    // 5. Obtener información del usuario
    const userData = await prisma.user.findUnique({
      where: { id: user.user.id },
      include: {
        subscription: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 6. Verificar si ya tiene una suscripción activa
    if (userData.subscription && userData.subscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ya tienes una suscripción activa' },
        { status: 400 }
      );
    }

    let culqiCustomerId: string;
    let culqiCardId: string;
    let culqiSubscriptionId: string;

    // 7. Crear o usar customer en Culqi
    if (userData.subscription?.culqiCustomerId) {
      // Ya tiene un customer en Culqi, reutilizarlo
      culqiCustomerId = userData.subscription.culqiCustomerId;
      console.log('✅ Reutilizando customer existente:', culqiCustomerId);
    } else {
      // Crear nuevo customer en Culqi
      console.log('📝 Creando customer en Culqi...');
      
      // TODO: Cuando tengas credenciales, descomenta esto:
      const culqiCustomer = await createCustomer({
        email: userData.email,
        first_name: userData.name || 'Usuario',
        last_name: 'Time4Swim',
        phone_number: undefined,
      });
      
      culqiCustomerId = culqiCustomer.id;
      console.log('✅ Customer creado:', culqiCustomerId);
    }

    // 8. Guardar tarjeta en Culqi
    console.log('💳 Guardando tarjeta en Culqi...');
    
    // TODO: Cuando tengas credenciales, descomenta esto:
    const culqiCard = await createCard(culqiCustomerId, culqiToken);
    
    culqiCardId = culqiCard.id;
    console.log('✅ Tarjeta guardada:', culqiCardId, 'Brand:', culqiCard.brand);

    // 9. Crear suscripción en Culqi
    console.log('🔄 Creando suscripción en Culqi...');
    
    // TODO: Cuando tengas credenciales, verifica que los plan IDs sean correctos
    const culqiPlanId = CULQI_PLAN_IDS[planId as keyof typeof CULQI_PLAN_IDS];
    
    const culqiSub = await createSubscription({
      customer_id: culqiCustomerId,
      card_id: culqiCardId,
      plan_id: culqiPlanId,
    });
    
    culqiSubscriptionId = culqiSub.id;
    console.log('✅ Suscripción creada en Culqi:', culqiSubscriptionId);

    // 10. Calcular fechas
    const now = new Date();
    const currentPeriodEnd = new Date(culqiSub.current_period_end * 1000);
    
    // 11. Crear o actualizar suscripción en nuestra base de datos
    const subscription = await prisma.subscription.upsert({
      where: {
        userId: user.user.id,
      },
      create: {
        userId: user.user.id,
        plan: planConfig.plan as any,
        status: 'ACTIVE',
        currentPrice: planConfig.price,
        currency: 'PEN',
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        culqiCustomerId: culqiCustomerId,
        culqiSubscriptionId: culqiSubscriptionId,
        culqiCardId: culqiCardId,
        maxChildren: planConfig.maxChildren,
      },
      update: {
        plan: planConfig.plan as any,
        status: 'ACTIVE',
        currentPrice: planConfig.price,
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        culqiSubscriptionId: culqiSubscriptionId,
        culqiCardId: culqiCardId,
        maxChildren: planConfig.maxChildren,
        canceledAt: null,
      },
    });

    // 12. Actualizar usuario
    await prisma.user.update({
      where: { id: user.user.id },
      data: {
        accountStatus: 'ACTIVE',
        isTrialAccount: false,
      },
    });

    // 13. Crear registro de pago inicial
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: planConfig.price,
        currency: 'PEN',
        status: PaymentStatus.PENDING,
        paymentMethod: 'CARD',
        description: `Suscripción ${planConfig.name} - Primer cobro`,
        culqiChargeId: `pending_${Date.now()}`, // Se actualizará cuando llegue el webhook
        paidAt: null,
      },
    });

    console.log('✅ Suscripción completada exitosamente');

    // 14. Retornar éxito
    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: planConfig.name,
        price: planConfig.price,
        maxChildren: planConfig.maxChildren,
        currentPeriodEnd: currentPeriodEnd,
        cardBrand: culqiCard.brand,
        cardLastFour: culqiCard.last_four,
      },
    });

  } catch (error: any) {
    console.error('❌ Error creando suscripción:', error);
    
    return NextResponse.json(
      {
        error: 'Error al crear la suscripción',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
