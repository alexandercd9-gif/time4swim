import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST: Extender trial de usuario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAuth(request, ['ADMIN']);
    const { days } = await request.json();
    const resolvedParams = await params;

    if (!days || days <= 0) {
      return NextResponse.json(
        { message: 'Número de días inválido' },
        { status: 400 }
      );
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular nueva fecha de expiración
    const currentExpiry = user.trialExpiresAt || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    // Actualizar usuario
    const updatedUser = await (prisma as any).user.update({
      where: { id: resolvedParams.id },
      data: {
        trialExpiresAt: newExpiry,
        trialExtendedBy: adminUser.id,
        trialExtendedAt: new Date(),
        accountStatus: 'TRIAL' // Reactivar si estaba expirado
      }
    });

    return NextResponse.json({
      message: `Trial extendido ${days} días exitosamente`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        trialExpiresAt: updatedUser.trialExpiresAt,
        extendedBy: adminUser.name
      }
    });

  } catch (error) {
    console.error('Error extendiendo trial:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}