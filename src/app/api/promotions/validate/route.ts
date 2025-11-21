import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Validar código promocional
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 });
    }

    // Buscar promoción
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promotion) {
      return NextResponse.json({ error: "Código no válido" }, { status: 404 });
    }

    // Validar que esté activa
    if (!promotion.isActive) {
      return NextResponse.json({ error: "Código desactivado" }, { status: 400 });
    }

    // Validar fechas
    const now = new Date();
    if (now < promotion.startDate) {
      return NextResponse.json({ error: "Código aún no disponible" }, { status: 400 });
    }
    if (now > promotion.endDate) {
      return NextResponse.json({ error: "Código expirado" }, { status: 400 });
    }

    // Validar usos máximos
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
      return NextResponse.json({ error: "Código agotado" }, { status: 400 });
    }

    // Retornar datos de la promoción
    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        durationMonths: promotion.durationMonths
      }
    });
  } catch (error) {
    console.error("Error validating promotion:", error);
    return NextResponse.json({ error: "Error al validar código" }, { status: 500 });
  }
}
