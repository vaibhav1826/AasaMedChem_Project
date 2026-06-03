import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./_components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);



  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-50 font-sans">
      <AdminSidebar email={session?.user?.email || ""} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
