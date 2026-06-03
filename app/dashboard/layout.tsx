"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Package, LayoutDashboard, Settings, LogOut, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <span>Aasa<span className="text-blue-600">MedChem</span></span>
            </Link>
            <nav className="hidden md:flex gap-1">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                Products
              </Link>
              <Link 
                href="/dashboard/orders" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard/orders' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                Order History
              </Link>
              {session?.user?.role === "admin" && (
                <Link 
                  href="/admin" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors flex items-center gap-1.5"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{session?.user?.email}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{session?.user?.role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <motion.div 
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-6 py-8"
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t bg-white dark:bg-zinc-900 mt-auto">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AasaMedChem Project. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="https://github.com/vaibhav1826/AasaMedChem_Project" className="flex items-center gap-1 hover:text-foreground transition-colors">
              GitHub <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
