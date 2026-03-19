import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-zinc-950 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
