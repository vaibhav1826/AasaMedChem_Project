"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useCart, CartItem } from "./CartContext";
import { formatINR } from "@/lib/format";
import { UNITS_FOR_BASE_UNIT } from "@/lib/units";

export function CartDrawer() {
  const { items, removeItem, updateItem, isCartOpen, setIsCartOpen, submitOrder, isSubmitting } = useCart();
  
  const total = items.reduce((sum, item) => sum + item.lineTotalInr, 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger render={<Button variant="outline" className="relative gap-2 border-zinc-200 dark:border-zinc-800" />}>
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Order Cart</span>
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            {items.length}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <SheetHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <SheetTitle>Your Order Cart</SheetTitle>
          <SheetDescription>
            Adjust quantities and units below. Prices update live as you change units (g/kg, mL/L, or count).
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <ShoppingCart className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />
            ))
          )}
        </div>
        
        <SheetFooter className="border-t border-zinc-100 dark:border-zinc-900 pt-6 flex-col">
          <div className="flex justify-between w-full text-lg font-bold mb-4">
            <span>Total INR</span>
            <span className="text-blue-600">{formatINR(total)}</span>
          </div>
          <Button 
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={submitOrder} 
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function CartItemRow({ 
  item, 
  updateItem, 
  removeItem 
}: { 
  item: CartItem; 
  updateItem: (id: string, updates: Partial<CartItem>) => void; 
  removeItem: (id: string) => void;
}) {
  const allowedUnits = UNITS_FOR_BASE_UNIT[item.baseUnit] || [item.baseUnit];

  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
      <div className="flex justify-between items-start gap-4">
        <div className="font-semibold">{item.productName}</div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2 items-center">
        <Input 
          type="number" 
          min="0.000001" 
          step="any"
          className="w-24 bg-white dark:bg-zinc-950" 
          value={item.orderedQuantity}
          onChange={(e) => updateItem(item.id, { orderedQuantity: parseFloat(e.target.value) || 0 })}
        />
        <select
          className="h-10 rounded-md border border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300"
          value={item.orderedUnit}
          onChange={(e) => updateItem(item.id, { orderedUnit: e.target.value })}
        >
          {allowedUnits.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-2 mb-1">
          <span>{item.orderedQuantity || 0} {item.orderedUnit}</span>
          <ArrowRight className="h-3 w-3" />
          <span>{item.baseQuantity} {item.baseUnit}</span>
        </div>
        <div>
          {item.baseQuantity} {item.baseUnit} &times; {formatINR(item.pricePerBaseUnit)}/{item.baseUnit} 
          <span className="font-bold text-zinc-900 dark:text-zinc-100 ml-2">= {formatINR(item.lineTotalInr)}</span>
        </div>
      </div>
      
      {item.baseQuantity > item.stockQuantity && (
        <div className="text-xs text-red-500 font-medium">
          Warning: Only {item.stockQuantity} {item.baseUnit} available in stock. Order may be delayed.
        </div>
      )}
    </div>
  );
}
