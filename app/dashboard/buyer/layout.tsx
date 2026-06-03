import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BuyerHeader } from "./_components/BuyerHeader";
import { QuotationCartProvider } from "./_components/QuotationCartContext";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "buyer") {
    redirect("/login");
  }

  return (
    <QuotationCartProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
        <BuyerHeader email={session.user?.email || ""} />
        
        <main className="flex-1 relative z-0">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </QuotationCartProvider>
  );
}
