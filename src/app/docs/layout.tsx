import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentación - Time4Swim | Guías y Tutoriales",
  description: "Guías completas y tutoriales para aprovechar al máximo Time4Swim. Aprende sobre cronometraje, gestión de nadadores, análisis y más.",
  openGraph: {
    title: "Documentación - Time4Swim",
    description: "Guías y tutoriales completos para Time4Swim",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
