"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminFooter } from "@/components/layout/AdminFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans">
      <AdminHeader />
      
      <main className="flex-1 relative z-0">
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

      <AdminFooter />
    </div>
  );
}
