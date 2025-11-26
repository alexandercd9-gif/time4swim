import { NextRequest, NextResponse } from 'next/server';
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
        const { preapprovalId, planId, userId } = await request.json();

        console.log('📥 Procesando preapproval:', { preapprovalId, planId, userId });

        if (!preapprovalId || !planId || !userId) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Validar plan
        const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
        if (!planConfig) {
            return NextResponse.json(
                { error: 'Plan inválido' },
                { status: 400 }
            );
        }

        // Obtener información del preapproval desde MercadoPago
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            return NextResponse.json(
                { error: 'MercadoPago no configurado' },
                { status: 500 }
            );
        }

        const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error('❌ Error obteniendo preapproval de MP');
            return NextResponse.json(
                { error: 'Error al verificar suscripción' },
                { status: 500 }
            );
        }

        const preapproval = await response.json();
        console.log('✅ Preapproval obtenido:', preapproval);

        // Verificar si la suscripción ya existe
        const existingSubscription = await prisma.subscription.findUnique({
            where: { userId: userId },
        });

        // Calcular fecha de fin del periodo (30 días de trial)
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        if (existingSubscription) {
            // Actualizar suscripción existente
            await prisma.subscription.update({
                where: { userId: userId },
                data: {
                    plan: planConfig.plan,
                    status: 'ACTIVE',
                    currentPrice: planConfig.price,
                    currency: 'PEN',
                    currentPeriodEnd: periodEnd,
                    processor: 'mercadopago',
                    mercadopagoPreapprovalId: preapprovalId,
                    maxChildren: planConfig.maxChildren,
                },
            });
            console.log('✅ Suscripción actualizada');
        } else {
            // Crear nueva suscripción
            await prisma.subscription.create({
                data: {
                    userId: userId,
                    plan: planConfig.plan,
                    status: 'ACTIVE',
                    currentPrice: planConfig.price,
                    currency: 'PEN',
                    currentPeriodEnd: periodEnd,
                    processor: 'mercadopago',
                    mercadopagoPreapprovalId: preapprovalId,
                    maxChildren: planConfig.maxChildren,
                },
            });
            console.log('✅ Nueva suscripción creada');
        }

        // Actualizar usuario
        await prisma.user.update({
            where: { id: userId },
            data: {
                isTrialAccount: true,
                trialExpiresAt: periodEnd,
                accountStatus: 'ACTIVE',
            },
        });

        console.log('✅ Usuario actualizado');

        return NextResponse.json({
            success: true,
            message: 'Suscripción procesada exitosamente',
        });

    } catch (error: any) {
        console.error('❌ Error procesando preapproval:', error);
        return NextResponse.json(
            { error: error.message || 'Error al procesar suscripción' },
            { status: 500 }
        );
    }
}
