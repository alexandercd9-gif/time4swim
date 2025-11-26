import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Configuración de planes
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

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const authUser = await requireAuth(request, ['PARENT', 'ADMIN']);
    if (!authUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 1.5 Obtener usuario completo de la base de datos
    const user = await (prisma as any).user.findUnique({
      where: { id: authUser.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o sin email' },
        { status: 400 }
      );
    }

    // 2. Obtener datos del request
    const { planId, token, cardholderName } = await request.json();

    if (!planId || !token) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // 3. Validar plan
    const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      );
    }

    // 4. Obtener token de acceso de MercadoPago (primero .env, luego DB)
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'MercadoPago no configurado - falta ACCESS_TOKEN' },
        { status: 500 }
      );
    }

    // 5. Buscar o crear cliente en MercadoPago
    const nameParts = user.name?.trim().split(' ') || ['Usuario', 'Time4Swim'];
    const firstName = nameParts[0] || 'Usuario';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Time4Swim';

    console.log('🔍 Buscando customer MP por email:', user.email);

    // Buscar customer existente por email
    const searchResponse = await fetch(`https://api.mercadopago.com/v1/customers/search?email=${user.email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    let customer;

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.results && searchResult.results.length > 0) {
        // Customer ya existe, reutilizarlo
        customer = searchResult.results[0];
        console.log('✅ Customer existente encontrado:', customer.id);
      }
    }

    // Si no existe, crear uno nuevo
    if (!customer) {
      console.log('📝 Creando nuevo customer MP...');
      const customerResponse = await fetch('https://api.mercadopago.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.json();
        console.error('❌ Error MP:', error);
        const errorDetail = error.cause?.[0]?.description || error.message || 'error';
        throw new Error(`Error MP: ${errorDetail}`);
      }

      customer = await customerResponse.json();
      console.log('✅ Nuevo customer creado:', customer.id);
    }

    // 6. Asociar tarjeta al cliente
    const cardResponse = await fetch(`https://api.mercadopago.com/v1/customers/${customer.id}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      }),
    });

    if (!cardResponse.ok) {
      const error = await cardResponse.json();
      console.error('Error asociando tarjeta MP:', error);
      throw new Error('Error al asociar tarjeta');
    }

    const card = await cardResponse.json();
    console.log('✅ Tarjeta asociada:', card.id);

    // 7. Crear suscripción en la base de datos
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const subscription = await (prisma as any).subscription.create({
      data: {
        userId: user.id,
        plan: planConfig.plan,
        status: 'ACTIVE',
        currentPrice: planConfig.price,
        currency: 'PEN',
        currentPeriodEnd: periodEnd,
        processor: 'mercadopago',
        mercadopagoCustomerId: customer.id,
        mercadopagoCardId: card.id,
        maxChildren: planConfig.maxChildren,
      },
    });

    // 8. Actualizar usuario
    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        isTrialAccount: true,
        trialExpiresAt: periodEnd,
        accountStatus: 'ACTIVE',
      },
    });

    console.log('✅ Suscripción MercadoPago creada exitosamente');

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      trialEnd: periodEnd.toISOString(),
      message: '¡Suscripción activada! Tienes 30 días de prueba gratis.',
    });

  } catch (error: any) {
    console.error('Error en create-mercadopago:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la suscripción' },
      { status: 500 }
    );
  }
}
