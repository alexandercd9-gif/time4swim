const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubscriptions() {
  try {
    console.log('🔍 Buscando suscripciones con problemas...\n');

    // Primero, usar SQL directo para ver registros problemáticos
    const problematicSubs = await prisma.$queryRaw`
      SELECT id, userId, plan, status 
      FROM Subscription 
      WHERE plan = '' OR plan IS NULL OR plan NOT IN (
        'TRIAL', 
        'PARENT_BASIC', 
        'PARENT_FAMILY', 
        'PARENT_PREMIUM', 
        'CLUB_FREE', 
        'CLUB_PRO_TRIAL', 
        'CLUB_PRO'
      )
    `;

    if (problematicSubs.length === 0) {
      console.log('✅ No se encontraron suscripciones con problemas');
      return;
    }

    console.log(`⚠️  Encontradas ${problematicSubs.length} suscripciones problemáticas:`);
    console.log(problematicSubs);
    console.log('\n📝 Corrigiendo...\n');

    // Corregir registros con plan vacío o inválido
    for (const sub of problematicSubs) {
      console.log(`Actualizando suscripción ${sub.id} (userId: ${sub.userId})`);
      
      // Actualizar directamente con SQL
      await prisma.$executeRaw`
        UPDATE Subscription 
        SET plan = 'PARENT_BASIC',
            currentPrice = 0,
            status = 'ACTIVE'
        WHERE id = ${sub.id}
      `;
      
      console.log(`  ✅ Actualizada a PARENT_BASIC`);
    }

    console.log('\n✨ Todas las suscripciones han sido corregidas');

    // Mostrar todas las suscripciones actualizadas
    const allSubs = await prisma.$queryRaw`
      SELECT id, userId, plan, status, currentPrice 
      FROM Subscription
    `;
    
    console.log('\n📊 Estado actual de suscripciones:');
    console.table(allSubs);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscriptions();
