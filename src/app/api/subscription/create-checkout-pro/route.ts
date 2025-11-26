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

        // 2. Obtener usuario completo de la base de datos
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
        const { planId } = await request.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan requerido' },
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

        // 5. Obtener token de acceso de MercadoPago
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'MercadoPago no configurado - falta ACCESS_TOKEN' },
                { status: 500 }
            );
        }

        // 6. Crear o buscar Customer en MercadoPago
        console.log('📝 Buscando/Creando Customer en MercadoPago...');

        // Buscar customer existente por email
        let customerId = null;
        const searchResponse = await fetch(`https://api.mercadopago.com/v1/customers/search?email=${encodeURIComponent(user.email)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.results && searchData.results.length > 0) {
                customerId = searchData.results[0].id;
                console.log('✅ Customer existente encontrado:', customerId);
            }
        }

        // Si no existe, crear nuevo customer
        if (!customerId) {
            console.log('📝 Creando nuevo Customer...');
            const customerData = {
                email: user.email,
                first_name: user.name?.split(' ')[0] || 'Usuario',
                last_name: user.name?.split(' ').slice(1).join(' ') || 'Time4Swim',
            };

            const createCustomerResponse = await fetch('https://api.mercadopago.com/v1/customers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            if (!createCustomerResponse.ok) {
                const error = await createCustomerResponse.json();
                console.error('❌ Error creando Customer:', error);
                return NextResponse.json(
                    { error: 'Error al crear cliente en MercadoPago', details: error },
                    { status: 500 }
                );
            }

            const newCustomer = await createCustomerResponse.json();
            customerId = newCustomer.id;
            console.log('✅ Customer creado:', customerId);
        }

        // 7. Crear Preapproval Plan (Suscripción recurrente)
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        baseUrl = baseUrl.trim();
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        // FIX: MercadoPago rechaza localhost en back_url para Preapproval
        let backUrl = `${baseUrl}/subscription/success?planId=${planId}&userId=${user.id}`;

        if (baseUrl.includes('localhost')) {
            console.warn('⚠️ Localhost detectado: Usando URL placeholder para back_url de MercadoPago');
            backUrl = `https://www.google.com/search?q=pago_exitoso_time4swim&planId=${planId}`;
        }

        const preapprovalData = {
            reason: `Suscripción ${planConfig.name} - Time4Swim`,
            auto_recurring: {
                frequency: 1,
                frequency_type: 'months',
                transaction_amount: planConfig.price,
                currency_id: 'PEN',
                // NOTA: free_trial removido porque MercadoPago Perú no lo soporta en Preapproval
                // El periodo de prueba se maneja en la aplicación
            },
            payer_id: customerId,
            back_url: backUrl,
            external_reference: `user_${user.id}_plan_${planId}_${Date.now()}`,
            status: 'pending',
        };

        console.log('📝 Creando Preapproval en MercadoPago...');
        console.log('🔗 Back URL:', backUrl);
        console.log('Datos:', JSON.stringify(preapprovalData, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preapprovalData),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error COMPLETO de MercadoPago:', JSON.stringify(error, null, 2));

            // Extraer mensaje más específico
            let errorMsg = error.message || 'Error desconocido';
            if (error.cause && error.cause.length > 0) {
                errorMsg = error.cause.map((c: any) => `${c.code}: ${c.description}`).join(', ');
            }

            return NextResponse.json(
                {
                    error: `Error MP: ${errorMsg}`,
                    fullError: error  // Devolver error completo para debugging
                },
                { status: 500 }
            );
        }

        const preapproval = await response.json();
        console.log('✅ Preapproval creado:', preapproval.id);

        // 8. Retornar URL de checkout
        return NextResponse.json({
            success: true,
            checkoutUrl: preapproval.init_point,
            preapprovalId: preapproval.id,
        });

    } catch (error: any) {
        console.error('Error en create-checkout-pro:', error);
        return NextResponse.json(
            { error: error.message || 'Error al procesar la suscripción' },
            { status: 500 }
        );
    }
}
