import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centro de Ayuda - Time4Swim | Preguntas Frecuentes",
  description: "Encuentra respuestas a tus preguntas sobre Time4Swim. FAQs sobre cronometraje, portabilidad de datos, cuentas, precios y más.",
  openGraph: {
    title: "Centro de Ayuda - Time4Swim",
    description: "Preguntas frecuentes y soporte para Time4Swim",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
