const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Verificar si el enum PaymentStatus existe
    const enums = await prisma.$queryRaw`SHOW COLUMNS FROM Payment WHERE Field = 'status'`;
    console.log('Campo status en Payment:');
    console.log(enums);
    
    // Verificar estructura completa de Payment
    const paymentStructure = await prisma.$queryRaw`DESCRIBE Payment`;
    console.log('\nEstructura de Payment:');
    paymentStructure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await prisma.$disconnect();
})();
