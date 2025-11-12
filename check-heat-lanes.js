const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHeatLanes() {
  try {
    const lanes = await prisma.heatLane.findMany({
      where: { finalTime: { not: null } },
      include: {
        event: {
          select: { title: true, style: true, distance: true }
        },
        swimmer: {
          select: { name: true }
        }
      }
    });
    
    console.log(`Carriles con tiempos finalizados: ${lanes.length}\n`);
    lanes.forEach(l => {
      const timeInMs = l.finalTime;
      const timeInSeconds = timeInMs / 1000;
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = (timeInSeconds % 60).toFixed(2);
      const formatted = `${minutes}:${seconds.padStart(5, '0')}`;
      
      console.log(`- ${l.swimmer?.name || 'Sin nadador'}: ${formatted} (${timeInSeconds.toFixed(2)}s) en ${l.event?.style} ${l.event?.distance}m (${l.event?.title})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHeatLanes();
