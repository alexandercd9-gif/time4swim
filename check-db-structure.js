const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estructura de base de datos...\n');

    // Verificar si existe la tabla userchild
    const tables = await prisma.$queryRaw`SHOW TABLES;`;
    console.log('📋 Tablas en la base de datos:');
    console.log(tables);

    // Intentar contar userchild
    try {
      const userChildCount = await prisma.userchild.count();
      console.log(`\n✅ Tabla userchild existe con ${userChildCount} registros`);
    } catch (e) {
      console.log('\n❌ Error al acceder a tabla userchild:', e.message);
    }

    // Ver estructura de un usuario
    const sampleUser = await prisma.user.findFirst({
      where: { role: 'PARENT' },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            userchild: true
          }
        }
      }
    });
    
    console.log('\n👤 Usuario de ejemplo:', sampleUser);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
