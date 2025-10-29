const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndFixUser() {
  try {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: 'alexandercd9@gmail.com' }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      console.log('Creando usuario con las credenciales correctas...');
      
      // Crear usuario si no existe
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newUser = await prisma.user.create({
        data: {
          name: 'Alexander',
          email: 'alexandercd9@gmail.com',
          password: hashedPassword
        }
      });
      
      console.log('✅ Usuario creado:', newUser);
      return;
    }

    console.log('👤 Usuario encontrado:', {
      id: user.id,
      name: user.name,
      email: user.email
    });

    // Verificar si la contraseña actual funciona
    const isValidPassword = await bcrypt.compare('admin123', user.password);
    
    if (isValidPassword) {
      console.log('✅ La contraseña "admin123" es correcta');
    } else {
      console.log('❌ La contraseña "admin123" no coincide');
      console.log('🔧 Actualizando contraseña...');
      
      // Actualizar con la contraseña correcta
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Contraseña actualizada correctamente');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUser();