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

        // 2. Obtener usuario completo
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

        // 3. Obtener datos del request
        const { planId, token } = await request.json();

        if (!planId || !token) {
            return NextResponse.json(
                { error: 'Plan y token requeridos' },
                { status: 400 }
            );
        }

        // 4. Validar plan
        const planConfig = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
        if (!planConfig) {
            return NextResponse.json(
                { error: 'Plan inválido' },
                { status: 400 }
            );
        }

        // 5. Obtener credenciales de Kushki
        const kushkiPrivateKey = process.env.KUSHKI_PRIVATE_KEY;
        const kushkiPublicKey = process.env.KUSHKI_PUBLIC_KEY;

        if (!kushkiPrivateKey || !kushkiPublicKey) {
            return NextResponse.json(
                { error: 'Kushki no configurado - faltan credenciales' },
                { status: 500 }
            );
        }

        console.log('📝 Creando suscripción en Kushki...');
        console.log('Usuario:', user.email);
        console.log('Plan:', planConfig.name, '-', planConfig.price);

        // 6. Crear cargo en Kushki
        const chargeData = {
            token: {
                token: token
            },
            amount: {
                currency: 'PEN',
                subtotalIva: 0,
                subtotalIva0: planConfig.price,
                iva: 0
            },
            contactDetails: {
                email: user.email
            },
            metadata: {
                userId: user.id,
                planId: planId,
                planName: planConfig.name,
                subscriptionType: 'recurring'
            }
        };

        const chargeResponse = await fetch('https://api.kushkipagos.com/v1/charges', {
            method: 'POST',
            headers: {
                'Private-Merchant-Id': kushkiPrivateKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chargeData),
        });

        if (!chargeResponse.ok) {
            const error = await chargeResponse.json();
            console.error('❌ Error en Kushki:', error);
            return NextResponse.json(
                { error: 'Error al procesar el pago', details: error },
                { status: 500 }
            );
        }

        const charge = await chargeResponse.json();
        console.log('✅ Cargo creado en Kushki:', charge.ticketNumber);

        // 7. Calcular fechas
        const startDate = new Date();
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
        const currentPeriodEnd = new Date(trialExpiresAt);

        // 8. Crear suscripción en la base de datos
        const subscription = await (prisma as any).subscription.create({
            data: {
                userId: user.id,
                plan: planConfig.plan,
                status: 'ACTIVE',
                currentPrice: planConfig.price,
                currency: 'PEN',
                startDate: startDate,
                currentPeriodStart: startDate,
                currentPeriodEnd: currentPeriodEnd,
                processor: 'kushki',
                maxChildren: planConfig.maxChildren,
            },
        });

        console.log('✅ Suscripción creada en BD:', subscription.id);

        // 9. Actualizar usuario
        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                isTrialAccount: true,
                trialExpiresAt: trialExpiresAt,
                accountStatus: 'ACTIVE',
            },
        });

        console.log('✅ Usuario actualizado con periodo de prueba');

        // 10. Retornar éxito
        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
            trialExpiresAt: trialExpiresAt.toISOString(),
            message: '¡Suscripción creada! Tienes 30 días gratis.'
        });

    } catch (error: any) {
        console.error('Error en create-kushki:', error);
        return NextResponse.json(
            { error: error.message || 'Error al procesar la suscripción' },
            { status: 500 }
        );
    }
}
