import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWebhookSignature } from '@/lib/culqi';
import { PaymentStatus } from '@prisma/client';

/**
 * Webhook de Culqi
 * 
 * Este endpoint recibe eventos de Culqi cuando ocurren pagos, cancelaciones, etc.
 * 
 * Eventos importantes:
 * - charge.succeeded: Cargo exitoso (pago mensual recibido)
 * - charge.failed: Cargo fallido (tarjeta rechazada)
 * - subscription.activated: Suscripción activada
 * - subscription.canceled: Suscripción cancelada
 * - subscription.updated: Suscripción actualizada
 * 
 * Configurar en Culqi Dashboard:
 * 1. Ir a Configuración > Webhooks
 * 2. Agregar URL: https://tudominio.com/api/webhooks/culqi
 * 3. Seleccionar eventos: charge.*, subscription.*
 * 4. Guardar el secreto del webhook (diferente al secret key)
 */

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener el cuerpo del request
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    // 2. Validar firma (seguridad)
    const signature = request.headers.get('x-culqi-signature');
    const webhookSecret = process.env.CULQI_WEBHOOK_SECRET;

    // TODO: Cuando tengas el webhook secret de Culqi, descomenta esto:
    // if (!signature || !validateWebhookSignature(rawBody, signature, webhookSecret)) {
    //   console.error('❌ Webhook signature inválida');
    //   return NextResponse.json(
    //     { error: 'Invalid signature' },
    //     { status: 401 }
    //   );
    // }

    console.log('📨 Webhook recibido:', event.type);

    // 3. Procesar evento según tipo
    switch (event.type) {
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(event.data);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;

      default:
        console.log('⚠️  Evento no manejado:', event.type);
    }

    // 4. Siempre retornar 200 a Culqi
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error);
    
    // Aún así retornar 200 para no hacer que Culqi reintente
    return NextResponse.json({ received: true });
  }
}

/**
 * Cargo exitoso - Se recibió un pago mensual
 */
async function handleChargeSucceeded(charge: any) {
  console.log('✅ Cargo exitoso:', charge.id, 'Monto:', charge.amount / 100);

  try {
    // Encontrar la suscripción por customer_id o subscription_id
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { culqiCustomerId: charge.email }, // Buscar por email si no hay customer_id
          { culqiSubscriptionId: charge.metadata?.subscription_id },
        ],
      },
    });

    if (!subscription) {
      console.error('❌ Suscripción no encontrada para charge:', charge.id);
      return;
    }

    // Crear registro de pago
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: charge.amount / 100, // Convertir de centavos a soles
        currency: charge.currency_code,
        status: PaymentStatus.PAID,
        paymentMethod: 'CARD',
        description: 'Pago mensual de suscripción',
        culqiChargeId: charge.id,
        paidAt: new Date(charge.creation_date * 1000),
        cardBrand: charge.source?.brand || 'Visa',
        cardLastFour: charge.source?.last_four || '****',
      },
    });

    // Actualizar suscripción: extender periodo
    const nextPeriodEnd = new Date(subscription.currentPeriodEnd);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: subscription.currentPeriodEnd,
        currentPeriodEnd: nextPeriodEnd,
        status: 'ACTIVE',
      },
    });

    // Actualizar usuario
    await prisma.user.update({
      where: { id: subscription.userId! },
      data: {
        accountStatus: 'ACTIVE',
      },
    });

    console.log('✅ Pago registrado y suscripción extendida:', payment.id);

    // TODO: Enviar email de confirmación de pago
    // await sendPaymentConfirmationEmail(subscription.userId, payment);

  } catch (error) {
    console.error('❌ Error procesando cargo exitoso:', error);
  }
}

/**
 * Cargo fallido - Tarjeta rechazada
 */
async function handleChargeFailed(charge: any) {
  console.log('❌ Cargo fallido:', charge.id, 'Razón:', charge.failure_message);

  try {
    // Encontrar la suscripción
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { culqiCustomerId: charge.email },
          { culqiSubscriptionId: charge.metadata?.subscription_id },
        ],
      },
      include: {
        user: true,
      },
    });

    if (!subscription) {
      console.error('❌ Suscripción no encontrada para charge fallido:', charge.id);
      return;
    }

    // Crear registro de pago fallido
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: charge.amount / 100,
        currency: charge.currency_code,
        status: PaymentStatus.FAILED,
        paymentMethod: 'CARD',
        description: 'Intento de pago mensual (fallido)',
        failedReason: charge.failure_message || 'Tarjeta rechazada',
        culqiChargeId: charge.id,
        paidAt: null,
      },
    });

    // Actualizar suscripción a PAST_DUE
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    });

    // Actualizar usuario
    await prisma.user.update({
      where: { id: subscription.userId! },
      data: {
        accountStatus: 'SUSPENDED',
      },
    });

    console.log('⚠️  Suscripción marcada como PAST_DUE');

    // TODO: Enviar email de alerta al usuario
    // await sendPaymentFailedEmail(subscription.user, charge.failure_message);

  } catch (error) {
    console.error('❌ Error procesando cargo fallido:', error);
  }
}

/**
 * Suscripción activada
 */
async function handleSubscriptionActivated(subscriptionData: any) {
  console.log('✅ Suscripción activada:', subscriptionData.id);

  try {
    // Actualizar suscripción en nuestra DB (ahora culqiSubscriptionId es unique)
    const subscription = await prisma.subscription.findUnique({
      where: { culqiSubscriptionId: subscriptionData.id },
    });
    
    if (!subscription) {
      console.error('❌ Suscripción no encontrada:', subscriptionData.id);
      return;
    }
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
      },
    });

    console.log('✅ Suscripción marcada como ACTIVE');

  } catch (error) {
    console.error('❌ Error procesando suscripción activada:', error);
  }
}

/**
 * Suscripción cancelada
 */
async function handleSubscriptionCanceled(subscriptionData: any) {
  console.log('🚫 Suscripción cancelada:', subscriptionData.id);

  try {
    // Encontrar suscripción (ahora culqiSubscriptionId es unique)
    const subscription = await prisma.subscription.findUnique({
      where: { culqiSubscriptionId: subscriptionData.id },
      include: {
        user: true,
      },
    });

    if (!subscription) {
      console.error('❌ Suscripción no encontrada:', subscriptionData.id);
      return;
    }

    // Actualizar suscripción
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    // Actualizar usuario
    await prisma.user.update({
      where: { id: subscription.userId! },
      data: {
        accountStatus: 'SUSPENDED',
      },
    });

    console.log('✅ Suscripción cancelada en DB');

    // TODO: Enviar email de confirmación de cancelación
    // await sendCancellationConfirmationEmail(subscription.user);

  } catch (error) {
    console.error('❌ Error procesando cancelación:', error);
  }
}

/**
 * Suscripción actualizada (cambio de plan, etc)
 */
async function handleSubscriptionUpdated(subscriptionData: any) {
  console.log('🔄 Suscripción actualizada:', subscriptionData.id);

  try {
    // Actualizar datos en nuestra DB (ahora culqiSubscriptionId es unique)
    const subscription = await prisma.subscription.findUnique({
      where: { culqiSubscriptionId: subscriptionData.id },
    });
    
    if (!subscription) {
      console.error('❌ Suscripción no encontrada:', subscriptionData.id);
      return;
    }
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        status: subscriptionData.status === 'active' ? 'ACTIVE' : 'CANCELED',
      },
    });

    console.log('✅ Suscripción actualizada en DB');

  } catch (error) {
    console.error('❌ Error procesando actualización:', error);
  }
}
