const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function viewDatabase() {
  try {
    console.log('=== USUARIOS EN LA BASE DE DATOS ===\n');
    
    const users = await prisma.user.findMany({
      include: {
        children: {
          include: {
            records: true,
            trainings: true
          }
        }
      }
    });
    
    users.forEach(user => {
      console.log(`👤 Usuario: ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Rol: ${user.role}`);
      console.log(`   📅 Creado: ${user.createdAt}`);
      console.log(`   👶 Hijos: ${user.children.length}`);
      
      user.children.forEach(child => {
        console.log(`      - 🏊 ${child.name} (${child.gender})`);
        console.log(`        📊 Registros: ${child.records.length}`);
        console.log(`        🏃 Entrenamientos: ${child.trainings.length}`);
      });
      console.log('');
    });
    
    console.log('=== ESTADÍSTICAS ===');
    console.log(`Total usuarios: ${users.length}`);
    console.log(`Total administradores: ${users.filter(u => u.role === 'ADMIN').length}`);
    console.log(`Total padres: ${users.filter(u => u.role === 'PARENT').length}`);
    console.log(`Total hijos: ${users.reduce((total, user) => total + user.children.length, 0)}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

viewDatabase();