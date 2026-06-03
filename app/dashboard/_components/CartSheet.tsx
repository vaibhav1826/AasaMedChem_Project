"use client";

import { useCart } from "./CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function CartSheet() {
  const { items, removeItem, isCartOpen, setIsCartOpen, submitOrder, isSubmitting } = useCart();

  const orderTotal = items.reduce((sum, item) => sum + item.lineTotalInr, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-blue-600 text-white rounded-full">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.productName}</h4>
                    <p className="text-sm text-zinc-500 mt-1">
                      {item.orderedQuantity} {item.orderedUnit}
                    </p>
                    <div className="font-medium text-blue-600 dark:text-blue-400 mt-2">
                      {formatINR(item.lineTotalInr)}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 -mt-2 -mr-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-xl">{formatINR(orderTotal)}</span>
          </div>
          <Button 
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={items.length === 0 || isSubmitting}
            onClick={submitOrder}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
