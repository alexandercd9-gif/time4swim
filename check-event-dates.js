const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: {
      isInternalCompetition: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
  });

  console.log('\n=== EVENTOS RECIENTES ===\n');
  events.forEach(e => {
    console.log(`Título: ${e.title}`);
    console.log(`Start Date: ${e.startDate.toISOString()}`);
    console.log(`End Date: ${e.endDate.toISOString()}`);
    console.log(`Start Date (local): ${e.startDate.toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}`);
    console.log(`End Date (local): ${e.endDate.toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}`);
    console.log(`---\n`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
