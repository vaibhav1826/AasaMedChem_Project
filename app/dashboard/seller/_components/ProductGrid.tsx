"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProductCard as SellerProductCard } from "./ProductCard";
import { BuyerProductCard } from "@/app/dashboard/buyer/_components/BuyerProductCard";

export function ProductGrid({ initialProducts, role = "seller" }: { initialProducts: any[], role?: "seller" | "buyer" }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", "Chemicals", "Solvents", "Acids", "Consumables"];

  const filtered = initialProducts.filter((p) => {
    const s = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s));
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            className="pl-10" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${
                categoryFilter === cat 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          role === "seller" 
            ? <SellerProductCard key={p.id} product={p} />
            : <BuyerProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-zinc-500 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 border-dashed">
          No products found matching your filters.
        </div>
      )}
    </div>
  );
}
