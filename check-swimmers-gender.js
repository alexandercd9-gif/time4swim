const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSwimmers() {
  const clubId = 'cmhpql0dc0004uqdwl7cfwrwo'; // Deporclub
  
  console.log('\n🏊 Verificando nadadores del club Deporclub\n');
  
  const swimmers = await prisma.child.findMany({
    where: { clubId },
    select: {
      id: true,
      name: true,
      gender: true,
      birthDate: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Total de nadadores: ${swimmers.length}\n`);
  
  swimmers.forEach((swimmer, index) => {
    console.log(`${index + 1}. ${swimmer.name}`);
    console.log(`   Género: ${swimmer.gender || '❌ NO CONFIGURADO'}`);
    console.log(`   Fecha Nac: ${swimmer.birthDate}`);
    console.log('');
  });
  
  const withoutGender = swimmers.filter(s => !s.gender).length;
  if (withoutGender > 0) {
    console.log(`\n⚠️  ${withoutGender} nadador(es) SIN género configurado`);
  }
  
  await prisma.$disconnect();
}

checkSwimmers().catch(console.error);
