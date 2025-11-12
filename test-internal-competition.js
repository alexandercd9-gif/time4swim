const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInternalCompetition() {
  const pabloId = 'cmhvd9fx8000quqs8vgnpz1wz';
  
  console.log('=== Probando competencias internas para Pablo Marmol ===\n');
  
  // Obtener todos los HeatLane de Pablo
  const lanes = await prisma.heatLane.findMany({
    where: {
      swimmerId: pabloId,
      finalTime: { not: null }
    },
    include: {
      event: {
        select: {
          title: true,
          style: true,
          distance: true
        }
      }
    }
  });
  
  console.log(`Total carriles con tiempo: ${lanes.length}\n`);
  
  lanes.forEach(lane => {
    const timeInMs = lane.finalTime;
    const timeInSeconds = timeInMs / 1000;
    console.log(`- Evento: ${lane.event?.title}`);
    console.log(`  Estilo: ${lane.event?.style}, Distancia: ${lane.event?.distance}m`);
    console.log(`  Tiempo: ${timeInSeconds.toFixed(2)}s (${timeInMs}ms)`);
    console.log('');
  });
  
  // Simular el endpoint con distancia 200
  console.log('=== Simulando endpoint con distance=200 ===\n');
  
  const styles = ['FREESTYLE', 'BACKSTROKE', 'BREASTSTROKE', 'BUTTERFLY', 'INDIVIDUAL_MEDLEY', 'MEDLEY_RELAY'];
  const result = {};
  styles.forEach(s => {
    result[s] = null;
    result[`${s}_distance`] = null;
  });
  
  for (const lane of lanes) {
    if (!lane.finalTime || !lane.event?.style) continue;
    
    const style = lane.event.style;
    const current = result[style];
    
    // Filtrar por distancia 200
    if (lane.event.distance !== 200) {
      console.log(`❌ Descartando ${style} porque distancia es ${lane.event.distance}m, no 200m`);
      continue;
    }
    
    const timeInSeconds = lane.finalTime / 1000;
    
    if (current == null || timeInSeconds < current) {
      result[style] = timeInSeconds;
      result[`${style}_distance`] = lane.event.distance;
      console.log(`✅ Actualizando ${style}: ${timeInSeconds.toFixed(2)}s`);
    }
  }
  
  console.log('\n=== Resultado final ===');
  console.log(JSON.stringify({ bestTimes: result }, null, 2));
  
  await prisma.$disconnect();
}

testInternalCompetition();
