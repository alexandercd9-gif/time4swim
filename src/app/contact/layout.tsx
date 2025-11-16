import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time4Swim - Contacto',
  description: 'Contacto de Time4Swim. Escríbenos para soporte, preguntas comerciales o presentaciones.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
