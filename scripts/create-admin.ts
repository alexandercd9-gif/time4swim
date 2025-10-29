import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe el usuario admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@time4swim.com' }
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', existingAdmin);
      return;
    }

    // Crear el hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear el usuario admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@time4swim.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario admin creado exitosamente:', adminUser);
  } catch (error) {
    console.error('❌ Error al crear usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();