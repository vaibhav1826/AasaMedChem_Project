"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-center z-10 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tighter"
        >
          Aasa<span className="text-blue-500">MedChem</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/login">
            <Button variant="secondary" className="font-medium">Sign In</Button>
          </Link>
        </motion.div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center relative px-4">
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
            Enterprise Wholesale, <br className="hidden md:block"/>
            <span className="text-blue-500">Perfect Precision.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Our state-of-the-art B2B platform dynamically converts your physical units on the fly while maintaining rigorous accounting precision in the backend. 
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12">
                Access Portal
              </Button>
            </Link>
            <Link href="https://github.com/vaibhav1826/AasaMedChem_Project">
              <Button size="lg" variant="outline" className="border-zinc-700 text-black hover:bg-zinc-800 hover:text-white px-8 h-12">
                View on GitHub
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 border-t border-zinc-800/50 text-center text-zinc-500 text-sm z-10">
        <p>© {new Date().getFullYear()} AasaMedChem Project. All rights reserved.</p>
      </footer>
    </div>
  );
}
