import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los procesadores configurados (público, sin autenticación)
export async function GET() {
  try {
    // Usar SystemConfig estructurado (no el key-value systemconfig)
    const config = await prisma.systemConfig.findFirst({
      select: { 
        activePaymentProcessor: true,
        mercadopagoPublicKey: true 
      }
    });

    const processors = [];
    const activeProcessor = config?.activePaymentProcessor || 'culqi';

    // Solo agregar el procesador activo configurado
    if (activeProcessor === 'culqi') {
      processors.push({
        id: 'culqi',
        name: 'Culqi',
        logo: '/logos/culqi.svg',
        description: 'Tarjetas Visa y Mastercard',
        publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
      });
    } else if (activeProcessor === 'mercadopago') {
      processors.push({
        id: 'mercadopago',
        name: 'MercadoPago',
        logo: '/logos/mercadopago.svg',
        description: 'Tarjetas y métodos locales',
        publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      });
    }

    // Si no hay configuración, fallback a Culqi
    if (processors.length === 0) {
      processors.push({
        id: 'culqi',
        name: 'Culqi',
        logo: '/logos/culqi.svg',
        description: 'Tarjetas Visa y Mastercard',
        publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
      });
    }

    return NextResponse.json({ 
      processors,
      activeProcessor
    });

  } catch (error) {
    console.error('Error fetching processor config:', error);
    return NextResponse.json({ 
      processors: [{
        id: 'culqi',
        name: 'Culqi',
        logo: '/logos/culqi.svg',
        description: 'Tarjetas Visa y Mastercard',
        publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY
      }]
    }, { status: 500 });
  }
}
