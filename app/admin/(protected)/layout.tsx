import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./_components/AdminSidebar";

import { AdminMobileHeader } from "./_components/AdminMobileHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-50 font-sans">
      {/* Mobile Header (Hidden on Desktop) */}
      <AdminMobileHeader email={session?.user?.email || ""} />
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <AdminSidebar email={session?.user?.email || ""} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
