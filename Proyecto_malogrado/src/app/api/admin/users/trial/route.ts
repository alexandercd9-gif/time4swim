import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET: Obtener usuarios trial con filtros
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request, ['ADMIN']);
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const status = searchParams.get('status');

    let whereClause: any = {};

    // Filtros por tipo de cuenta
    switch (filter) {
      case 'trial':
        whereClause.isTrialAccount = true;
        whereClause.accountStatus = 'TRIAL';
        break;
      case 'permanent':
        whereClause.isTrialAccount = false;
        whereClause.accountStatus = 'ACTIVE';
        break;
      case 'expired':
        whereClause.accountStatus = 'EXPIRED';
        break;
      case 'expiring_soon':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        whereClause.isTrialAccount = true;
        whereClause.trialExpiresAt = {
          lte: tomorrow
        };
        break;
    }

    // Filtro adicional por status
    if (status) {
      whereClause.accountStatus = status;
    }

    const users = await (prisma as any).user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        isTrialAccount: true,
        trialExpiresAt: true,
        trialExtendedBy: true,
        trialExtendedAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular días restantes para usuarios trial
    const usersWithDaysLeft = users.map((user: any) => {
      let daysLeft = null;
      if (user.isTrialAccount && user.trialExpiresAt) {
        const now = new Date();
        const expiry = new Date(user.trialExpiresAt);
        const diffTime = expiry.getTime() - now.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...user,
        daysLeft
      };
    });

    return NextResponse.json({ users: usersWithDaysLeft });

  } catch (error) {
    console.error('Error obteniendo usuarios trial:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}