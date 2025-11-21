/**
 * Script para configurar el club "deporclub" con novedades sin leer
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar el club "deporclub" por email o nombre
    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { name: { contains: 'deporclub' } },
          { email: { contains: 'deporclub' } }
        ]
      }
    });

    if (!club) {
      console.log('❌ No se encontró el club "deporclub"');
      console.log('💡 Verifica el nombre exacto del club');
      return;
    }

    console.log(`\n📋 Club encontrado: ${club.name}`);
    console.log(`   ID: ${club.id}`);
    console.log(`   Email: ${club.email || 'No especificado'}`);

    // Actualizar el club para que tenga novedades sin leer
    const updated = await prisma.club.update({
      where: { id: club.id },
      data: {
        hasUnreadNews: true,
        lastNewsReadAt: null
      }
    });

    console.log('\n✅ Club actualizado exitosamente');
    console.log(`   hasUnreadNews: ${updated.hasUnreadNews} 🔴`);
    console.log(`   isProTrial: ${updated.isProTrial}`);
    console.log(`   isProActive: ${updated.isProActive}`);
    console.log(`   proTrialStartedAt: ${updated.proTrialStartedAt || 'No iniciado'}`);
    
    console.log('\n🎯 Ahora puedes:');
    console.log('   1. Iniciar sesión como: admin@deporclub.com');
    console.log('   2. Ir al dashboard del club');
    console.log('   3. Ver el botón ✨ Novedades con BADGE ROJO al lado de la campana 🔔');
    console.log('   4. Hacer clic para ver el panel lateral con las funciones PRO');
    console.log('   5. Activar el trial PRO de 30 días GRATIS (sin tarjeta)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
