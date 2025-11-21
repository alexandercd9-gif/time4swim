const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'jjshirly@hotmail.com' },
    include: { 
      subscription: true,
      _count: {
        select: { children: true }
      }
    }
  });
  
  console.log('=== Usuario jjshirly@hotmail.com ===');
  console.log('ID:', user.id);
  console.log('Nombre:', user.name);
  console.log('Email:', user.email);
  console.log('Rol:', user.role);
  console.log('Estado:', user.accountStatus);
  console.log('Es Trial:', user.isTrialAccount);
  console.log('Trial Expira:', user.trialExpiresAt);
  console.log('Suscripción:', user.subscription);
  console.log('Cantidad de hijos:', user._count.children);
  
  await prisma.$disconnect();
}

main();
