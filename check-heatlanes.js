const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHeatLanes() {
  const eventId = 'cmhv0rpk10007uq9wb2zkkbha';
  
  console.log('\n📊 Verificando HeatLanes para evento:', eventId);
  
  const lanes = await prisma.heatLane.findMany({
    where: { eventId },
    include: {
      swimmer: {
        select: {
          id: true,
          name: true,
          gender: true,
          birthDate: true
        }
      }
    },
    orderBy: [
      { heatNumber: 'asc' },
      { lane: 'asc' }
    ]
  });
  
  console.log(`\n✅ Total de carriles: ${lanes.length}\n`);
  
  lanes.forEach((lane, index) => {
    console.log(`${index + 1}. Carril ${lane.lane} - Serie ${lane.heatNumber}`);
    console.log(`   Nadador: ${lane.swimmer?.name || 'NO ASIGNADO'}`);
    console.log(`   Género: ${lane.swimmer?.gender || 'N/A'}`);
    console.log(`   Tiempo Final: ${lane.finalTime ? `${lane.finalTime}ms` : 'NO REGISTRADO'}`);
    console.log('');
  });
  
  const withSwimmers = lanes.filter(l => l.swimmerId).length;
  const withTimes = lanes.filter(l => l.finalTime).length;
  
  console.log(`\n📈 Resumen:`);
  console.log(`   - Carriles con nadador: ${withSwimmers}/${lanes.length}`);
  console.log(`   - Carriles con tiempo: ${withTimes}/${lanes.length}`);
  
  await prisma.$disconnect();
}

checkHeatLanes().catch(console.error);
