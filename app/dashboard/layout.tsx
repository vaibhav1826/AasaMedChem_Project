"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BuyerHeader } from "@/components/layout/BuyerHeader";
import { BuyerFooter } from "@/components/layout/BuyerFooter";
import { CartProvider } from "./_components/CartContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
        <BuyerHeader />
        
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

        <BuyerFooter />
      </div>
    </CartProvider>
  );
}
