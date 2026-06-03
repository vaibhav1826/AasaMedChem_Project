"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, FlaskConical } from "lucide-react";
import { QuotationCartDrawer } from "./QuotationCartDrawer";

export function BuyerHeader({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard/buyer" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            <span>AasaMedChem <span className="text-purple-600">Buyer</span></span>
          </Link>
          <nav className="hidden md:flex gap-1">
            <Link 
              href="/dashboard/buyer" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard/buyer' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
              Products
            </Link>
            <Link 
              href="/dashboard/buyer/quotations" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/dashboard/buyer/quotations') ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
              My Quotations
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-medium">{email}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Buyer</span>
          </div>
          <QuotationCartDrawer />
          <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
