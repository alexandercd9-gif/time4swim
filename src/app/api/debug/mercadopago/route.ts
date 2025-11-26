import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAuth(request, ['PARENT', 'ADMIN']);
        if (!authResult || !authResult.user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

        return NextResponse.json({
            hasAccessToken: !!accessToken,
            hasPublicKey: !!publicKey,
            accessTokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : 'NO_TOKEN',
            publicKeyPrefix: publicKey ? publicKey.substring(0, 15) + '...' : 'NO_KEY',
            accessTokenLength: accessToken?.length || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
