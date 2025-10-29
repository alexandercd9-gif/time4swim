const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creando usuario administrador...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@time4swim.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`Email: ${admin.email}`);
    console.log(`Contraseña: admin123`);
    console.log(`Rol: ${admin.role}`);
    
    // También crear un usuario padre de ejemplo
    const parentPassword = await bcrypt.hash('parent123', 10);
    
    const parent = await prisma.user.create({
      data: {
        name: 'Juan Pérez',
        email: 'padre@time4swim.com',
        password: parentPassword,
        role: 'PARENT'
      }
    });
    
    console.log('\n✅ Usuario padre creado exitosamente:');
    console.log(`Email: ${parent.email}`);
    console.log(`Contraseña: parent123`);
    console.log(`Rol: ${parent.role}`);
    
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();