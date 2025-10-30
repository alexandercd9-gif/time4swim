import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="parent" />
      <div className="flex-1 flex flex-col">
        <Header role="parent" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}