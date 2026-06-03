"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuotationCart } from "./QuotationCartContext";
import { FileText } from "lucide-react";

export function BuyerProductCard({ product }: { product: any }) {
  const { addItem } = useQuotationCart();
  
  const handleAdd = () => {
    // Add default quantity 1 to cart
    addItem({
      productId: product.id,
      productName: product.name,
      baseUnit: product.baseUnit,
      orderedQuantity: 1,
      orderedUnit: product.baseUnit, 
      baseQuantity: 1,
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
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
              {product.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 text-sm text-zinc-600 dark:text-zinc-400 flex flex-col justify-between">
        {product.description && <p className="mb-4 line-clamp-2">{product.description}</p>}
        
        <div className="space-y-3 mt-auto p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-md border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col items-center justify-center py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Contact for pricing</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-4 p-4">
        <Button onClick={handleAdd} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <FileText className="h-4 w-4" />
          Request Quote
        </Button>
      </CardFooter>
    </Card>
  );
}
