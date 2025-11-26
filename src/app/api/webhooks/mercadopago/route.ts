import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook de MercadoPago para notificaciones de pagos
 * Documentación: https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📩 Webhook MercadoPago recibido:', {
            type: body.type,
            action: body.action,
            data: body.data
        });

        // MercadoPago envía notificaciones de diferentes tipos
        // Nos interesan principalmente: payment, subscription_preapproval

        if (body.type === 'payment') {
            await handlePaymentNotification(body.data.id);
        } else if (body.type === 'subscription_preapproval' || body.type === 'subscription_authorized_payment') {
            await handleSubscriptionNotification(body.data.id);
        }

        // Siempre devolver 200 para que MercadoPago no reintente
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('❌ Error procesando webhook MercadoPago:', error);
        // Aún así devolver 200 para evitar reintentos infinitos
        return NextResponse.json({ error: 'processed' }, { status: 200 });
    }
}

async function handlePaymentNotification(paymentId: string) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('❌ No hay ACCESS_TOKEN configurado');
            return;
        }

        // Obtener detalles del pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error('❌ Error obteniendo pago:', await response.text());
            return;
        }

        const payment = await response.json();

        console.log('💳 Pago recibido:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transaction_amount,
            payer: payment.payer?.email
        });

        // Buscar suscripción por customer ID
        const subscription = await prisma.subscription.findFirst({
            where: {
                mercadopagoCustomerId: payment.payer?.id?.toString(),
                processor: 'mercadopago'
            },
            include: {
                user: true
            }
        });

        if (!subscription) {
            console.warn('⚠️ No se encontró suscripción para el pago:', paymentId);
            return;
        }

        // Procesar según el estado del pago
        if (payment.status === 'approved') {
            // Pago exitoso
            console.log('✅ Pago aprobado para suscripción:', subscription.id);

            // Extender el período de suscripción
            const newPeriodEnd = new Date(subscription.currentPeriodEnd);
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'ACTIVE',
                    currentPeriodEnd: newPeriodEnd,
                    currentPeriodStart: subscription.currentPeriodEnd
                }
            });

            // Registrar el pago
            await prisma.payment.create({
                data: {
                    id: `mp_${paymentId}`,
                    subscriptionId: subscription.id,
                    culqiChargeId: paymentId, // Reutilizamos este campo para MercadoPago
                    amount: payment.transaction_amount,
                    currency: payment.currency_id,
                    paymentMethod: 'CARD',
                    cardBrand: payment.payment_method_id,
                    cardLastFour: payment.card?.last_four_digits,
                    status: 'PAID',
                    paidAt: new Date(payment.date_approved),
                    description: `Pago mensual - ${subscription.plan}`,
                    updatedAt: new Date()
                }
            });

            // Actualizar usuario a ACTIVE si estaba en trial o expirado
            if (subscription.user) {
                await prisma.user.update({
                    where: { id: subscription.user.id },
                    data: {
                        accountStatus: 'ACTIVE',
                        isTrialAccount: false
                    }
                });
            }

            console.log('✅ Suscripción renovada hasta:', newPeriodEnd);

        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            // Pago rechazado
            console.error('❌ Pago rechazado:', payment.status_detail);

            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'PAST_DUE'
                }
            });

            // TODO: Enviar email al usuario notificando el fallo
            console.log('🚨 Notificar al usuario:', subscription.user?.email);
        }

    } catch (error) {
        console.error('❌ Error manejando notificación de pago:', error);
    }
}

async function handleSubscriptionNotification(preapprovalId: string) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) return;

        // Obtener detalles del preapproval
        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error('❌ Error obteniendo preapproval:', await response.text());
            return;
        }

        const preapproval = await response.json();

        console.log('📋 Preapproval actualizado:', {
            id: preapproval.id,
            status: preapproval.status
        });

        // Buscar suscripción
        const subscription = await prisma.subscription.findFirst({
            where: {
                mercadopagoSubscriptionId: preapprovalId
            }
        });

        if (!subscription) {
            console.warn('⚠️ No se encontró suscripción para preapproval:', preapprovalId);
            return;
        }

        // Actualizar estado según el preapproval
        if (preapproval.status === 'cancelled') {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'CANCELED',
                    canceledAt: new Date()
                }
            });
            console.log('🚫 Suscripción cancelada:', subscription.id);
        }

    } catch (error) {
        console.error('❌ Error manejando notificación de suscripción:', error);
    }
}
