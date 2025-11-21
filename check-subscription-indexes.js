const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const indexes = await prisma.$queryRaw`SHOW INDEX FROM Subscription WHERE Column_name = 'culqiSubscriptionId'`;
  console.log('Índices para culqiSubscriptionId:');
  console.log(indexes);
  
  const allIndexes = await prisma.$queryRaw`SHOW INDEX FROM Subscription`;
  console.log('\nTodos los índices de Subscription:');
  allIndexes.forEach(idx => {
    console.log(`- ${idx.Key_name} (${idx.Column_name}) ${idx.Non_unique === 0 ? 'UNIQUE' : 'INDEX'}`);
  });
  
  await prisma.$disconnect();
})();
