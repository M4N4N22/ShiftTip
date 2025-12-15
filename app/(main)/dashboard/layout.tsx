import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      {/* Main content */}
      <main className="ml-64 w-full px-8 py-10">
        {children}
      </main>
    </div>
  );
}
