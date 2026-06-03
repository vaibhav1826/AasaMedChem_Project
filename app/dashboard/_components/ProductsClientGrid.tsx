"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderModal } from "./OrderModal";
import { formatINR } from "@/lib/format";
import { fromBaseQuantity } from "@/lib/units";

export function ProductsClientGrid({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialProducts.filter((p) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s));
  });

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          className="pl-10" 
          placeholder="Search products by name or category..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => {
          // Calculate price display for other units
          let displayPriceStr = `${formatINR(p.pricePerBaseUnit)}/${p.baseUnit}`;
          
          if (p.baseUnit === 'g') {
            const kgPrice = p.pricePerBaseUnit * 1000;
            displayPriceStr += ` · ${formatINR(kgPrice)}/kg`;
          } else if (p.baseUnit === 'mL') {
            const lPrice = p.pricePerBaseUnit * 1000;
            displayPriceStr += ` · ${formatINR(lPrice)}/L`;
          }

          return (
            <Card key={p.id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-1">{p.sku}</p>
                  </div>
                  {p.category && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {p.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                {p.description && <p className="mb-4 line-clamp-3">{p.description}</p>}
                
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">Rate</span>
                    <span className="font-medium">{displayPriceStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Stock</span>
                    <span>{parseFloat(p.stockQuantity)} {p.baseUnit}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t mt-4">
                <OrderModal product={p} />
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-zinc-500">
          No products found matching "{search}".
        </div>
      )}
    </div>
  );
}
