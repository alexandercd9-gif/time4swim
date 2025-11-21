const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateExpiredTrial() {
  try {
    console.log('🔍 Buscando usuario deporclub@time4swim.com...');
    
    // Buscar el usuario del club
    const user = await prisma.user.findUnique({
      where: {
        email: 'deporclub@time4swim.com'
      },
      include: {
        clubs: {
          include: {
            club: true
          }
        }
      }
    });

    if (!user || !user.clubs || user.clubs.length === 0) {
      console.log('❌ Usuario o club no encontrado');
      return;
    }

    const club = user.clubs[0].club;
    console.log(`✅ Club encontrado: ${club.name}`);

    // Simular trial expirado hace 2 días
    const trialStartDate = new Date();
    trialStartDate.setDate(trialStartDate.getDate() - 32); // Hace 32 días

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() - 2); // Expiró hace 2 días

    await prisma.club.update({
      where: { id: club.id },
      data: {
        isProTrial: false,        // Ya no está en trial
        isProActive: false,       // No está activo
        proTrialStartedAt: trialStartDate,
        proTrialExpiresAt: trialEndDate,
        hasUnreadNews: false
      }
    });

    console.log('✅ Trial configurado como expirado hace 2 días');
    console.log(`   - Inicio: ${trialStartDate.toLocaleDateString()}`);
    console.log(`   - Expiración: ${trialEndDate.toLocaleDateString()}`);
    console.log(`   - isProTrial: false`);
    console.log(`   - isProActive: false`);
    console.log('');
    console.log('🎯 Ahora inicia sesión con deporclub@time4swim.com para ver el modal');
    console.log('   Password: deporclub123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateExpiredTrial();
