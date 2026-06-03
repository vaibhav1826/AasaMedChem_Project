import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto relative z-10">
      <div className="container mx-auto px-6 py-6 pb-12 sm:pb-6 flex justify-between items-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} AasaMedChem Admin. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/vaibhav1826/AasaMedChem_Project" className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
            Repository <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
