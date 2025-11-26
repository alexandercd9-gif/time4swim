import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json({ error: 'No access token' }, { status: 500 });
        }

        // Prueba 1: Preapproval más simple posible
        const minimalPreapproval = {
            reason: "Test Subscription",
            auto_recurring: {
                frequency: 1,
                frequency_type: "months",
                transaction_amount: 10,
                currency_id: "PEN"
            },
            back_url: "https://www.google.com",
            payer_email: "test_user_123@test.com"
        };

        console.log('Testing minimal preapproval:', JSON.stringify(minimalPreapproval, null, 2));

        const response = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(minimalPreapproval),
        });

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            response: data,
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
