"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">B2B Portal</Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Products</Link>
              <Link href="/dashboard/orders" className="text-sm font-medium hover:text-primary transition-colors">My Orders</Link>
              {session?.user?.role === "admin" && (
                <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">Admin Panel</Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
