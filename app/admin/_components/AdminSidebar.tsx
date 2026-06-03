"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShieldCheck, LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Global Orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col hidden md:flex h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800 shrink-0">
        <Link href="/admin/dashboard" className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          <span>AasaMedChem <span className="text-emerald-500">Admin</span></span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800 shrink-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white truncate" title={email}>{email}</span>
            <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Admin</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-zinc-800 bg-transparent text-zinc-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
