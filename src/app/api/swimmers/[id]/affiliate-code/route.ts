import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT: Actualizar código de afiliado FDPN
export async function PUT(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const user = await requireAuth(request, ['ADMIN', 'PARENT']);
    const { fdpnAffiliateCode } = await request.json();
    const swimmerId = params.id;

    console.log(`🔄 Actualizando código de afiliado para nadador ${swimmerId}:`, fdpnAffiliateCode);

    // Verificar que el nadador existe y que el usuario tiene permisos
    const swimmer = await (prisma as any).child.findUnique({
      where: { id: swimmerId },
      include: {
        parents: {
          where: {
            userId: user.user.id
          }
        }
      }
    });

    if (!swimmer) return NextResponse.json({ message: 'Nadador no encontrado' }, { status: 404 });

    // Solo el padre del nadador o un admin pueden actualizar
    if (user.user.role !== 'ADMIN' && swimmer.parents.length === 0) return NextResponse.json({ message: 'No tienes permisos para editar este nadador' }, { status: 403 });

    // Validar formato del código si se proporciona
    if (fdpnAffiliateCode && typeof fdpnAffiliateCode !== 'string') return NextResponse.json({ message: 'El código de afiliado debe ser una cadena de texto' }, { status: 400 });

    // Si hay código, verificar que no esté ya en uso por otro nadador
    if (fdpnAffiliateCode && fdpnAffiliateCode.trim()) {
      const existingSwimmer = await (prisma as any).child.findFirst({ where: { fdpnAffiliateCode: fdpnAffiliateCode.trim(), NOT: { id: swimmerId } } });
      if (existingSwimmer) return NextResponse.json({ message: 'Este código de afiliado ya está en uso por otro nadador' }, { status: 400 });
    }

    // Actualizar código de afiliado
    const updatedSwimmer = await (prisma as any).child.update({ where: { id: swimmerId }, data: { fdpnAffiliateCode: fdpnAffiliateCode?.trim() || null }, include: { club: { select: { name: true } }, _count: { select: { records: true, trainings: true } } } });

    console.log(`✅ Código de afiliado actualizado para ${updatedSwimmer.name}`);

    return NextResponse.json({ message: 'Código de afiliado actualizado exitosamente', swimmer: updatedSwimmer });
  } catch (error) {
    console.error('Error updating affiliate code:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}