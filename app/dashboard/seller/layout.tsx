import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SellerHeader } from "./_components/SellerHeader";
import { CartProvider } from "./_components/CartContext";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);



  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
        <SellerHeader email={session?.user?.email || ""} />
        
        <main className="flex-1 relative z-0">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
