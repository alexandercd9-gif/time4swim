import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { Toaster } from "react-hot-toast";
import StructuredData from "@/components/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Time4Swim - Cronómetro y Gestión de Tiempos de Natación | Software para Clubes y Familias",
  description: "Plataforma profesional para registrar tiempos de natación con cronómetro inteligente. Análisis de evolución, gestión de entrenamientos y competencias para clubes deportivos y familias. Mejora el rendimiento de tus nadadores.",
  keywords: "cronómetro natación, tiempos de natación, software natación, gestión club natación, entrenamientos natación, competencias natación, análisis nadadores, tiempo nadadores, cronómetro piscina, app natación",
  authors: [{ name: "Time4Swim" }],
  creator: "Time4Swim",
  publisher: "Time4Swim",
  robots: "index, follow",
    openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://time4swim.com",
    siteName: "Time4Swim",
    title: "Time4Swim - Cronómetro y Gestión de Tiempos de Natación",
    description: "Software profesional para clubes de natación y familias. Cronómetro inteligente, análisis de evolución y gestión completa de entrenamientos.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Time4Swim - Plataforma de Gestión de Natación",
      },
    ],
  },
    twitter: {
    card: "summary_large_image",
    title: "Time4Swim - Cronómetro y Gestión de Tiempos de Natación",
    description: "Software profesional para clubes de natación y familias. Cronómetro inteligente, análisis de evolución y gestión completa de entrenamientos.",
    images: ["/og-image.svg"],
    creator: "@time4swim",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://time4swim.com",
  },
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="es">
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50`}>
        <SidebarProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </SidebarProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}