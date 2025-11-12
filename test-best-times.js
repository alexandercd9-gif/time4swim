const fetch = require('node-fetch');

async function testBestTimes() {
  try {
    // Pablo Marmol ID: necesitamos obtenerlo primero
    const swimmersRes = await fetch('http://localhost:3000/api/swimmers', {
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhwcWxnNWgwMDAxdXFkdzAwbmU2NjE3Iiwicm9sZSI6IlBBUkVOVCIsImlhdCI6MTczMTM2MDI4OCwiZXhwIjoxNzMxOTY1MDg4fQ.SyD4VzmQKc4xzAaUk9S8FDVXLtPcWQvjJWPe8WfVNlI'
      }
    });
    const swimmers = await swimmersRes.json();
    console.log('Nadadores:', swimmers.map(s => ({ id: s.id, name: s.name })));
    
    const pabloId = swimmers.find(s => s.name.includes('Pablo'))?.id;
    if (!pabloId) {
      console.log('No se encontró a Pablo Marmol');
      return;
    }
    
    console.log(`\nPablo Marmol ID: ${pabloId}`);
    
    // Prueba con INTERNAL_COMPETITION
    console.log('\n=== INTERNAL_COMPETITION ===');
    const internalRes = await fetch(`http://localhost:3000/api/parent/best-times?source=INTERNAL_COMPETITION&childId=${pabloId}`, {
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWhwcWxnNWgwMDAxdXFkdzAwbmU2NjE3Iiwicm9sZSI6IlBBUkVOVCIsImlhdCI6MTczMTM2MDI4OCwiZXhwIjoxNzMxOTY1MDg4fQ.SyD4VzmQKc4xzAaUk9S8FDVXLtPcWQvjJWPe8WfVNlI'
      }
    });
    const internal = await internalRes.json();
    console.log(JSON.stringify(internal, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBestTimes();
