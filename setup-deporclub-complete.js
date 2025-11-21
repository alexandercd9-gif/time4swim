/**
 * Crear club completo para usuario deporclub
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar el usuario con email admin@deporclub.com
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@deporclub.com'
      }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario admin@deporclub.com');
      return;
    }

    console.log(`\n👤 Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Rol: ${user.role}`);

    // Verificar si ya tiene un club
    const existingRelation = await prisma.userClub.findFirst({
      where: { userId: user.id },
      include: { club: true }
    });

    if (existingRelation) {
      console.log(`\n✅ Este usuario ya tiene un club:`);
      console.log(`   Club: ${existingRelation.club.name}`);
      console.log(`   ID: ${existingRelation.clubId}`);
      
      // Actualizar el club con novedades
      const updated = await prisma.club.update({
        where: { id: existingRelation.clubId },
        data: {
          hasUnreadNews: true,
          lastNewsReadAt: null
        }
      });
      
      console.log(`\n🔴 Novedades activadas para: ${updated.name}`);
      console.log(`   hasUnreadNews: ${updated.hasUnreadNews}`);
      
    } else {
      // Crear nuevo club
      const club = await prisma.club.create({
        data: {
          name: 'Deporclub',
          email: 'admin@deporclub.com',
          phone: null,
          address: null,
          website: null,
          description: 'Club de natación',
          isActive: true,
          hasUnreadNews: true,
          lastNewsReadAt: null
        }
      });

      console.log(`\n✅ Club creado:`);
      console.log(`   ID: ${club.id}`);
      console.log(`   Nombre: ${club.name}`);

      // Crear la relación UserClub
      const relation = await prisma.userClub.create({
        data: {
          userId: user.id,
          clubId: club.id,
          isActive: true
        }
      });

      console.log(`\n✅ Relación UserClub creada`);
      console.log(`   ID: ${relation.id}`);
    }

    console.log('\n🎯 LISTO PARA PROBAR:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log('   2. Inicia sesión: admin@deporclub.com');
    console.log('   3. En el TopBar verás: 🔔 (campana) y ✨ (novedades con BADGE ROJO)');
    console.log('   4. Haz clic en el botón de novedades');
    console.log('   5. Se abrirá el panel lateral con info del PRO trial');
    console.log('   6. Haz clic en "Activar 30 días GRATIS"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
