const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedStyles() {
  const styles = [
    { style: "FREESTYLE", nameEs: "Estilo Libre", nameEn: "Freestyle", description: "Crol o estilo libre", isActive: true },
    { style: "BACKSTROKE", nameEs: "Espalda", nameEn: "Backstroke", description: "Estilo de espalda", isActive: true },
    { style: "BREASTSTROKE", nameEs: "Pecho", nameEn: "Breaststroke", description: "Estilo de pecho", isActive: true },
    { style: "BUTTERFLY", nameEs: "Mariposa", nameEn: "Butterfly", description: "Estilo mariposa", isActive: true },
    { style: "INDIVIDUAL_MEDLEY", nameEs: "Medley Individual", nameEn: "Individual Medley", description: "Combinado individual (4 estilos)", isActive: true },
    { style: "MEDLEY_RELAY", nameEs: "Relevos Medley", nameEn: "Medley Relay", description: "Relevos combinados", isActive: true }
  ];

  console.log("🏊 Insertando estilos de natación...");
  
  for (const style of styles) {
    const existing = await prisma.swimStyleConfig.findFirst({
      where: { style: style.style }
    });

    if (existing) {
      console.log(`✅ ${style.nameEs} ya existe`);
    } else {
      await prisma.swimStyleConfig.create({ data: style });
      console.log(`✨ Creado: ${style.nameEs}`);
    }
  }

  console.log("\n🎉 ¡Estilos creados exitosamente!");
  
  const total = await prisma.swimStyleConfig.count();
  console.log(`📊 Total de estilos en DB: ${total}`);
}

seedStyles()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
