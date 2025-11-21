/**
 * Listar todos los usuarios para ver emails exactos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`\n👥 Usuarios encontrados: ${users.length}\n`);
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.role} - ${user.email}`);
      console.log(`   Nombre: ${user.name || 'N/A'}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
