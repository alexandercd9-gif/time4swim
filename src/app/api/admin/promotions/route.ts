import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth";

// GET: Listar todas las promociones
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req, ['ADMIN']);

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 });
  }
}

// POST: Crear nueva promoción
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req, ['ADMIN']);

    const body = await req.json();
    const { code, name, description, discountType, discountValue, durationMonths, startDate, endDate, maxUses } = body;

    // Validaciones
    if (!code || !name || !discountType || !discountValue || !durationMonths || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Validar que el código no exista
    const existing = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return NextResponse.json({ error: "El código ya existe" }, { status: 400 });
    }

    // Validar tipo de descuento
    if (discountType === 'PERCENTAGE' && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json({ error: "El porcentaje debe estar entre 1 y 100" }, { status: 400 });
    }

    if (discountType === 'FIXED' && discountValue <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    // Crear promoción
    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        name,
        description: description || null,
        discountType,
        discountValue,
        durationMonths,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: true,
        currentUses: 0
      }
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 });
  }
}

// PUT: Actualizar promoción existente
export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAuth(req, ['ADMIN']);

    const body = await req.json();
    const { id, name, description, discountType, discountValue, durationMonths, startDate, endDate, maxUses, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Validar que exista
    const existing = await prisma.promotion.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
    }

    // Actualizar
    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        discountType: discountType || existing.discountType,
        discountValue: discountValue !== undefined ? discountValue : existing.discountValue,
        durationMonths: durationMonths || existing.durationMonths,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses) : null) : existing.maxUses,
        isActive: isActive !== undefined ? isActive : existing.isActive
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json({ error: "Error al actualizar promoción" }, { status: 500 });
  }
}

// DELETE: Eliminar promoción
export async function DELETE(req: NextRequest) {
  try {
    const { user } = await requireAuth(req, ['ADMIN']);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Verificar si tiene suscripciones asociadas
    const subscriptions = await prisma.subscription.count({
      where: { promotionId: id }
    });

    if (subscriptions > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar. Hay ${subscriptions} suscripción(es) usando este código` 
      }, { status: 400 });
    }

    await prisma.promotion.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 });
  }
}
