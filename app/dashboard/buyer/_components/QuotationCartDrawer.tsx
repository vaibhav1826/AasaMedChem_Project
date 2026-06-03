"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, ArrowRight } from "lucide-react";
import { useQuotationCart, QuotationCartItem } from "./QuotationCartContext";
import { SUPPORTED_UNITS_FOR_BASE } from "@/lib/units";

export function QuotationCartDrawer() {
  const { items, removeItem, updateItem, isCartOpen, setIsCartOpen, submitQuotation, isSubmitting } = useQuotationCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative gap-2 border-zinc-200 dark:border-zinc-800">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Quotation Request</span>
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <SheetHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <SheetTitle>Quotation Request</SheetTitle>
          <SheetDescription>
            Specify your desired quantities. Our team will review and provide custom pricing.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <p>Your quotation list is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <QuotationItemRow key={item.id} item={item} updateItem={updateItem} removeItem={removeItem} />
            ))
          )}
        </div>
        
        <SheetFooter className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
          <Button 
            className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white" 
            onClick={submitQuotation} 
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting Request..." : "Submit Quotation Request"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function QuotationItemRow({ 
  item, 
  updateItem, 
  removeItem 
}: { 
  item: QuotationCartItem; 
  updateItem: (id: string, updates: Partial<QuotationCartItem>) => void; 
  removeItem: (id: string) => void;
}) {
  const allowedUnits = SUPPORTED_UNITS_FOR_BASE[item.baseUnit] || [item.baseUnit];

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
        <div className="flex items-center gap-2">
          <span>{item.orderedQuantity || 0} {item.orderedUnit}</span>
          <ArrowRight className="h-3 w-3" />
          <span>{item.baseQuantity} {item.baseUnit}</span>
        </div>
      </div>
    </div>
  );
}
