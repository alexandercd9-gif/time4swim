const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear usuario padre
    const hashedPassword = await bcrypt.hash('123456', 10);
    const parent = await prisma.user.create({
      data: {
        email: 'jjshirly@hotmail.com',
        name: 'JJ Shirly',
        password: hashedPassword,
        role: 'PARENT',
        accountStatus: 'ACTIVE'
      }
    });
    console.log('✅ Padre creado:', parent.email);

    // Crear hijo Liam
    const liam = await prisma.child.create({
      data: {
        name: 'Liam',
        birthDate: new Date('2015-01-15'),
        clubId: 'cmhpql0dc0004uqdwl7cfwrwo'
      }
    });
    console.log('✅ Hijo creado:', liam.name);

    // Crear hijo Dylan
    const dylan = await prisma.child.create({
      data: {
        name: 'Dylan',
        birthDate: new Date('2017-03-20'),
        clubId: 'cmhpql0dc0004uqdwl7cfwrwo'
      }
    });
    console.log('✅ Hijo creado:', dylan.name);

    // Crear relaciones padre-hijos
    await prisma.userChild.create({
      data: {
        userId: parent.id,
        childId: liam.id,
        isActive: true
      }
    });

    await prisma.userChild.create({
      data: {
        userId: parent.id,
        childId: dylan.id,
        isActive: true
      }
    });

    console.log('✅ Relaciones padre-hijos creadas exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
