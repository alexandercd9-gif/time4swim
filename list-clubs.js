/**
 * Listar todos los clubes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const clubs = await prisma.club.findMany();
    
    console.log(`\n🏢 Clubes encontrados: ${clubs.length}\n`);
    
    if (clubs.length === 0) {
      console.log('❌ No hay clubes en la base de datos');
      console.log('💡 El club debe estar en la tabla "Club", no solo en "User"');
      return;
    }
    
    clubs.forEach((club, i) => {
      console.log(`${i + 1}. ${club.name}`);
      console.log(`   ID: ${club.id}`);
      console.log(`   Email: ${club.email || 'N/A'}`);
      console.log(`   Activo: ${club.isActive}`);
      console.log(`   hasUnreadNews: ${club.hasUnreadNews}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
