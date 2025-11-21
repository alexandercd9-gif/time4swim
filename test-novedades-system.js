/**
 * Script para configurar un club con novedades sin leer
 * Esto permitirá probar el sistema de novedades
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar un club existente
    const club = await prisma.club.findFirst({
      where: { isActive: true }
    });

    if (!club) {
      console.log('❌ No se encontró ningún club activo');
      console.log('💡 Crea un club primero desde la aplicación');
      return;
    }

    console.log(`\n📋 Club encontrado: ${club.name}`);
    console.log(`   ID: ${club.id}`);

    // Actualizar el club para que tenga novedades sin leer
    const updated = await prisma.club.update({
      where: { id: club.id },
      data: {
        hasUnreadNews: true,
        lastNewsReadAt: null
      }
    });

    console.log('\n✅ Club actualizado exitosamente');
    console.log(`   hasUnreadNews: ${updated.hasUnreadNews}`);
    console.log(`   isProTrial: ${updated.isProTrial}`);
    console.log(`   isProActive: ${updated.isProActive}`);
    
    console.log('\n🎯 Ahora puedes:');
    console.log('   1. Iniciar sesión como administrador del club');
    console.log('   2. Ver el botón de Novedades con badge rojo al lado de la campana');
    console.log('   3. Hacer clic para ver el panel de novedades');
    console.log('   4. Activar el trial PRO de 30 días');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
