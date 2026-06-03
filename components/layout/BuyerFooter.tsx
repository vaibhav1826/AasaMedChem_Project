import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function BuyerFooter() {
  return (
    <footer className="border-t bg-white dark:bg-zinc-900 mt-auto relative z-10">
      <div className="container mx-auto px-6 py-6 pb-12 sm:pb-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
  );
}
