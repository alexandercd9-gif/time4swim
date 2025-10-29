import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST: Convertir usuario trial a permanente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser } = await requireAuth(request, ['ADMIN']);
    const resolvedParams = await params;

    const user = await (prisma as any).user.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Convertir a cuenta permanente
    const updatedUser = await (prisma as any).user.update({
      where: { id: resolvedParams.id },
      data: {
        accountStatus: 'ACTIVE',
        isTrialAccount: false,
        trialExpiresAt: null,
        trialExtendedBy: adminUser.id,
        trialExtendedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Usuario convertido a cuenta permanente exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        accountStatus: updatedUser.accountStatus,
        convertedBy: adminUser.name
      }
    });

  } catch (error) {
    console.error('Error convirtiendo usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}