"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-zinc-900 text-zinc-50 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-tight text-white">Admin Portal</Link>
            <nav className="flex gap-4">
              <Link href="/admin/products" className="text-sm font-medium hover:text-zinc-300 transition-colors">Products & Inventory</Link>
              <Link href="/admin/orders" className="text-sm font-medium hover:text-zinc-300 transition-colors">All Orders</Link>
              <Link href="/dashboard" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">Seller Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{session?.user?.email}</span>
            <Button variant="outline" size="sm" className="text-black bg-white hover:bg-zinc-200" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
