import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET - Obtener el procesador activo
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 });
    }

    // Buscar configuración del sistema
    const config = await prisma.systemConfig.findFirst({
      select: {
        activePaymentProcessor: true
      }
    });

    return NextResponse.json({ 
      activeProcessor: config?.activePaymentProcessor || 'culqi'
    });

  } catch (error) {
    console.error('Error fetching processor:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// POST - Guardar el procesador activo
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 });
    }

    const { activeProcessor, enabledProcessors } = await req.json();

    if (activeProcessor && !['culqi', 'mercadopago'].includes(activeProcessor)) {
      return NextResponse.json({ 
        error: 'Procesador inválido. Debe ser "culqi" o "mercadopago"' 
      }, { status: 400 });
    }

    // Guardar qué procesadores están habilitados (ambos pueden estar activos)
    if (enabledProcessors) {
      const culqiEnabled = enabledProcessors.includes('culqi');
      const mercadopagoEnabled = enabledProcessors.includes('mercadopago');

      // Obtener o crear registro de configuración
      let config = await (prisma as any).systemConfig.findFirst();
      
      if (!config) {
        config = await (prisma as any).systemConfig.create({
          data: {
            activePaymentProcessor: culqiEnabled ? 'culqi' : 'mercadopago'
          }
        });
      }
      
      // Actualizar activePaymentProcessor basado en selección
      const activeProcessor = culqiEnabled && !mercadopagoEnabled ? 'culqi' : 'mercadopago';
      
      await (prisma as any).systemConfig.update({
        where: { id: config.id },
        data: { 
          activePaymentProcessor: activeProcessor
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      enabledProcessors
    });

  } catch (error) {
    console.error('Error saving processor:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
