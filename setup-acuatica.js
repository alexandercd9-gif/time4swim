/**
 * Setup para club "Acuatica" - Configurar novedades y PRO trial
 * Ejecutar DESPUÉS de registrar el club desde la aplicación
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔍 Buscando club "Acuatica"...\n');

    // Buscar el club por nombre
    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { name: { contains: 'acuatica', mode: 'insensitive' } },
          { name: { contains: 'Acuatica' } }
        ]
      },
      include: {
        teachers: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!club) {
      console.log('❌ No se encontró el club "Acuatica"');
      console.log('\n💡 PASOS:');
      console.log('   1. Inicia el servidor: npm run dev');
      console.log('   2. Ve a http://localhost:3000/register');
      console.log('   3. Registra un usuario con rol CLUB');
      console.log('   4. Nombre del club: Acuatica');
      console.log('   5. Ejecuta este script nuevamente: node setup-acuatica.js');
      return;
    }

    console.log(`✅ Club encontrado: ${club.name}`);
    console.log(`   ID: ${club.id}`);
    console.log(`   Email: ${club.email || 'N/A'}`);
    console.log(`   Activo: ${club.isActive ? '✅' : '❌'}`);
    
    if (club.teachers.length > 0) {
      console.log(`\n👥 Administradores del club:`);
      club.teachers.forEach(t => {
        console.log(`   - ${t.user.name || t.user.email} (${t.user.email})`);
      });
    }

    // Verificar estado actual
    console.log(`\n📊 Estado actual:`);
    console.log(`   hasUnreadNews: ${club.hasUnreadNews ? '🔴 SÍ' : '⚪ NO'}`);
    console.log(`   isProTrial: ${club.isProTrial ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   isProActive: ${club.isProActive ? '✅ SÍ' : '❌ NO'}`);

    // Actualizar el club para mostrar novedades
    const updated = await prisma.club.update({
      where: { id: club.id },
      data: {
        hasUnreadNews: true,
        lastNewsReadAt: null,
        isProTrial: false,
        isProActive: false,
        proTrialStartedAt: null,
        proTrialExpiresAt: null
      }
    });

    console.log(`\n✅ Club actualizado correctamente!`);
    console.log(`\n🎯 AHORA PUEDES PROBAR:`);
    console.log(`   1. Inicia sesión con el usuario del club`);
    console.log(`   2. Ve al dashboard del club`);
    console.log(`   3. En el TopBar (arriba) verás:`);
    console.log(`      - 🔔 Campana (notificaciones)`);
    console.log(`      - ✨ Novedades con BADGE ROJO 🔴`);
    console.log(`   4. Haz clic en el botón de Novedades`);
    console.log(`   5. Se abrirá un panel lateral con:`);
    console.log(`      - Banner degradado cyan-blue`);
    console.log(`      - Lista de funciones PRO`);
    console.log(`      - Botón "Activar 30 días GRATIS"`);
    console.log(`   6. Al hacer clic en activar:`);
    console.log(`      - Se activa el trial PRO por 30 días`);
    console.log(`      - El badge rojo desaparece`);
    console.log(`      - El club tiene acceso a todas las funciones PRO`);

    console.log(`\n📋 Funciones PRO incluidas en el trial:`);
    console.log(`   📊 Reportes personalizados con logo del club`);
    console.log(`   📋 Sistema de asistencias digital`);
    console.log(`   🎨 Marca personalizada (logo + colores)`);
    console.log(`   🔗 Integración FDPN masiva`);
    console.log(`   📈 Estadísticas avanzadas del club`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
