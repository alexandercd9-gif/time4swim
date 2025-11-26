import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Access token no configurado' },
                { status: 500 }
            );
        }

        // Test 1: Verificar las credenciales
        const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({
                success: false,
                error: 'Credenciales inválidas',
                details: error,
            });
        }

        const paymentMethods = await response.json();

        // Extraer el país del primer método de pago
        const country = paymentMethods[0]?.id ? 'Credenciales válidas' : 'Sin métodos de pago';

        return NextResponse.json({
            success: true,
            message: 'Credenciales de MercadoPago válidas',
            country: country,
            paymentMethodsCount: paymentMethods.length,
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
