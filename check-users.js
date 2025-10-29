import { prisma } from '@/lib/prisma';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    
    console.log('Usuarios en la base de datos:');
    console.log(users);
    
    if (users.length === 0) {
      console.log('No hay usuarios en la base de datos');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();