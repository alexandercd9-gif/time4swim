import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// DELETE: Eliminar usuarios trial expirados
export async function DELETE(request: NextRequest) {
  try {
    const { user: adminUser } = await requireAuth(request, ['ADMIN']);

    const now = new Date();

    // Encontrar usuarios trial expirados
    const expiredUsers = await (prisma as any).user.findMany({
      where: {
        isTrialAccount: true,
        trialExpiresAt: {
          lt: now
        },
        accountStatus: {
          in: ['TRIAL', 'EXPIRED']
        }
      }
    });

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        message: 'No hay usuarios trial expirados para eliminar',
        deletedCount: 0
      });
    }

    // Eliminar usuarios expirados
    const deletedUsers = await (prisma as any).user.deleteMany({
      where: {
        id: {
          in: expiredUsers.map((u: any) => u.id)
        }
      }
    });

    return NextResponse.json({
      message: `${deletedUsers.count} usuarios trial expirados eliminados exitosamente`,
      deletedCount: deletedUsers.count,
      deletedUsers: expiredUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        expiredAt: u.trialExpiresAt
      }))
    });

  } catch (error) {
    console.error('Error eliminando usuarios expirados:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}