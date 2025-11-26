const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserChildRelations() {
  try {
    console.log('🔍 Verificando relaciones userchild...\n');

    // Ver todos los userchild
    const allUserChildren = await prisma.userchild.findMany({
      take: 10,
      include: {
        user: {
          select: { id: true, email: true, role: true }
        },
        child: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('📋 Registros en userchild:');
    console.log(JSON.stringify(allUserChildren, null, 2));

    // Ahora intentar obtener desde el lado del usuario
    const usersWithChildren = await prisma.user.findMany({
      where: { role: 'PARENT' },
      take: 3,
      select: {
        id: true,
        email: true,
        userchild: {
          where: { isActive: true },
          include: {
            child: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    console.log('\n👨‍👩‍👧‍👦 Usuarios con sus hijos:');
    console.log(JSON.stringify(usersWithChildren, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserChildRelations();
