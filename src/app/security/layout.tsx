import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seguridad - Time4Swim | Protección de Datos",
  description: "Conoce cómo Time4Swim protege tus datos con encriptación de grado bancario, backups automáticos y cumplimiento GDPR. Tu seguridad es nuestra prioridad.",
  openGraph: {
    title: "Seguridad - Time4Swim",
    description: "Protección de datos y medidas de seguridad en Time4Swim",
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
