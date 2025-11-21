const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmptyPlans() {
  try {
    console.log('🔍 Buscando suscripciones con problemas...\n');

    // Obtener todas las suscripciones
    const subscriptions = await prisma.$queryRaw`
      SELECT id, userId, plan, status, currentPrice, maxChildren
      FROM Subscription
    `;

    console.log(`📋 Total de suscripciones: ${subscriptions.length}\n`);

    // Mostrar suscripciones con problemas
    const problematicas = subscriptions.filter(s => !s.plan || s.plan === '');
    
    if (problematicas.length === 0) {
      console.log('✅ No se encontraron suscripciones con planes vacíos');
      return;
    }

    console.log(`❌ Suscripciones con plan vacío: ${problematicas.length}\n`);
    
    problematicas.forEach(sub => {
      console.log(`- ID: ${sub.id}`);
      console.log(`  Usuario: ${sub.userId}`);
      console.log(`  Plan actual: "${sub.plan || 'VACÍO'}"`);
      console.log(`  Precio: S/. ${sub.currentPrice}`);
      console.log(`  MaxChildren: ${sub.maxChildren}`);
      console.log('');
    });

    console.log('🔧 Corrigiendo suscripciones...\n');

    // Actualizar cada una basándonos en su configuración
    for (const sub of problematicas) {
      let planCorrect = 'PARENT_BASIC';
      
      // Determinar el plan correcto según maxChildren y precio
      if (sub.maxChildren === 1) {
        planCorrect = 'PARENT_BASIC';
      } else if (sub.maxChildren === 3) {
        planCorrect = 'PARENT_FAMILY';
      } else if (sub.maxChildren >= 6) {
        planCorrect = 'PARENT_PREMIUM';
      }

      await prisma.$executeRaw`
        UPDATE Subscription 
        SET plan = ${planCorrect}
        WHERE id = ${sub.id}
      `;

      console.log(`✅ Suscripción ${sub.id} actualizada a plan ${planCorrect}`);
    }

    console.log('\n✨ Todas las suscripciones han sido corregidas!');

    // Verificar
    console.log('\n🔍 Verificación final...\n');
    const verificacion = await prisma.$queryRaw`
      SELECT id, userId, plan, status, currentPrice, maxChildren
      FROM Subscription
    `;

    verificacion.forEach(sub => {
      const estado = sub.plan && sub.plan !== '' ? '✅' : '❌';
      console.log(`${estado} Subscription ${sub.id}: ${sub.plan || 'VACÍO'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmptyPlans();
