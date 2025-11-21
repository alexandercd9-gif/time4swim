/**
 * Script para verificar usuarios y clubes en la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Contar usuarios por rol
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log('\n📊 USUARIOS EN BASE DE DATOS:');
    console.log(`   Total: ${users.length}`);
    
    const roleCount = {};
    users.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    
    console.log('\n👥 Por rol:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    // Mostrar usuarios CLUB
    const clubUsers = users.filter(u => u.role === 'CLUB');
    if (clubUsers.length > 0) {
      console.log('\n🏊 Usuarios CLUB:');
      clubUsers.forEach(u => {
        console.log(`   - ${u.name || 'Sin nombre'} (${u.email})`);
      });
    }

    // Contar clubes
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        hasUnreadNews: true,
        isProTrial: true,
        isProActive: true
      }
    });

    console.log('\n🏢 CLUBES EN BASE DE DATOS:');
    console.log(`   Total: ${clubs.length}`);
    
    if (clubs.length > 0) {
      clubs.forEach(c => {
        console.log(`\n   📋 ${c.name}`);
        console.log(`      ID: ${c.id}`);
        console.log(`      Activo: ${c.isActive ? '✅' : '❌'}`);
        console.log(`      Novedades sin leer: ${c.hasUnreadNews ? '🔴 SÍ' : '⚪ NO'}`);
        console.log(`      PRO Trial: ${c.isProTrial ? '✅' : '❌'}`);
        console.log(`      PRO Activo: ${c.isProActive ? '✅' : '❌'}`);
      });
    }

    console.log('\n💡 PARA PROBAR EL SISTEMA:');
    if (clubs.length === 0) {
      console.log('   1. Registra un usuario con rol CLUB desde /register');
      console.log('   2. Ejecuta este script nuevamente');
    } else {
      console.log('   1. Inicia sesión con un usuario CLUB');
      console.log('   2. Verás el botón de Novedades con badge rojo');
      console.log('   3. Haz clic para activar el trial PRO');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
