"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, LogOut, ExternalLink, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <span>AasaMedChem <span className="text-emerald-500">Admin</span></span>
            </Link>
            <nav className="hidden md:flex gap-2">
              <Link 
                href="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Overview
              </Link>
              <Link 
                href="/admin/products" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin/products' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Products
              </Link>
              <Link 
                href="/admin/orders" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/admin/orders' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Global Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:flex text-sm text-zinc-400 hover:text-white items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Seller View
            </Link>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block mx-2" />
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{session?.user?.email}</span>
              <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Admin</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out" className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10">
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

      <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} AasaMedChem Admin. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/vaibhav1826/AasaMedChem_Project" className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
              Repository <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
