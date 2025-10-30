
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-blue-100 via-cyan-100 to-white min-h-screen">
        <UserProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}