import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}