"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useCart } from "./CartContext";
import { Plus } from "lucide-react";

export function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  
  // Format price
  let displayPriceStr = `${formatINR(product.pricePerBaseUnit)}/${product.baseUnit}`;
  if (product.baseUnit === 'g') {
    displayPriceStr += `  |  ${formatINR(product.pricePerBaseUnit * 1000)}/kg`;
  } else if (product.baseUnit === 'mL') {
    displayPriceStr += `  |  ${formatINR(product.pricePerBaseUnit * 1000)}/L`;
  }

  // Format stock
  const rawStock = parseFloat(product.stockQuantity);
  let stockStr = `${rawStock} ${product.baseUnit}`;
  if (product.baseUnit === 'g' && rawStock >= 1000) {
    stockStr = `${rawStock / 1000} kg`;
  } else if (product.baseUnit === 'mL' && rawStock >= 1000) {
    stockStr = `${rawStock / 1000} L`;
  }

  const handleAdd = () => {
    // Add default quantity 1 to cart
    addItem({
      productId: product.id,
      productName: product.name,
      baseUnit: product.baseUnit,
      pricePerBaseUnit: parseFloat(product.pricePerBaseUnit),
      orderedQuantity: 1,
      orderedUnit: product.baseUnit, // they can change it in the drawer
      baseQuantity: 1,
      lineTotalInr: parseFloat(product.pricePerBaseUnit),
      stockQuantity: parseFloat(product.stockQuantity),
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
            <p className="text-xs text-zinc-500 font-mono mt-1">{product.sku}</p>
          </div>
          {product.category && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
              {product.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 flex flex-col justify-between">
        {product.description && <p className="mb-4 line-clamp-2">{product.description}</p>}
        
        <div className="space-y-3 mt-auto p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500">Rate</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{displayPriceStr}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800/50">
            <span className="text-xs text-zinc-500 font-medium">In Stock: {stockStr}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-4 p-4">
        <Button onClick={handleAdd} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
