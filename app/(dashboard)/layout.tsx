import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Navbar />
      <main  className='p-4 pt-20 pl-[260px] bg-[#F5F5F5] min-h-screen overflow-y-auto' style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}