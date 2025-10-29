#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupExpiredTrials() {
  console.log('🧹 Iniciando limpieza automática de usuarios trial expirados...');
  
  try {
    const now = new Date();
    
    // Encontrar usuarios trial expirados hace más de 1 día (grace period)
    const gracePeriod = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 día atrás
    
    const expiredUsers = await (prisma as any).user.findMany({
      where: {
        isTrialAccount: true,
        trialExpiresAt: {
          lt: gracePeriod
        },
        accountStatus: {
          in: ['TRIAL', 'EXPIRED']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        trialExpiresAt: true,
        createdAt: true
      }
    });

    console.log(`📊 Encontrados ${expiredUsers.length} usuarios trial expirados`);

    if (expiredUsers.length === 0) {
      console.log('✅ No hay usuarios trial expirados para eliminar');
      return;
    }

    // Mostrar información de usuarios a eliminar
    expiredUsers.forEach((user: any) => {
      const daysExpired = Math.floor((now.getTime() - new Date(user.trialExpiresAt!).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   👤 ${user.name} (${user.email}) - Expirado hace ${daysExpired} días`);
    });

    // Eliminar usuarios expirados
    const result = await (prisma as any).user.deleteMany({
      where: {
        id: {
          in: expiredUsers.map((u: any) => u.id)
        }
      }
    });

    console.log(`🗑️  ${result.count} usuarios trial expirados eliminados exitosamente`);
    
    // Estadísticas finales
    const remainingTrials = await (prisma as any).user.count({
      where: {
        isTrialAccount: true,
        accountStatus: 'TRIAL'
      }
    });
    
    const permanentUsers = await (prisma as any).user.count({
      where: {
        isTrialAccount: false,
        accountStatus: 'ACTIVE'
      }
    });

    console.log(`📈 Estado actual:`);
    console.log(`   🟢 Usuarios permanentes: ${permanentUsers}`);
    console.log(`   🟡 Usuarios trial activos: ${remainingTrials}`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar limpieza si se ejecuta directamente
if (require.main === module) {
  cleanupExpiredTrials()
    .then(() => {
      console.log('✅ Limpieza completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { cleanupExpiredTrials };