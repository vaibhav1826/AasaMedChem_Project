"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { formatINR } from "@/lib/format";
import { SUPPORTED_UNITS_FOR_BASE, toBaseQuantity, calcLineTotal } from "@/lib/units";
import { useCart } from "./CartContext";

export function OrderModal({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(product.baseUnit);
  const { addItem } = useCart();

  const supportedUnits = SUPPORTED_UNITS_FOR_BASE[product.baseUnit] || [product.baseUnit];

  // Live calculation
  const numQty = parseFloat(quantity);
  let baseQty = 0;
  let lineTotal = 0;
  let calculationError = "";

  if (quantity && !isNaN(numQty) && numQty > 0) {
    try {
      baseQty = toBaseQuantity(numQty, unit);
      lineTotal = calcLineTotal(baseQty, parseFloat(product.pricePerBaseUnit));
      
      if (baseQty > parseFloat(product.stockQuantity)) {
        calculationError = "Insufficient stock available.";
      }
    } catch (e) {
      calculationError = "Invalid unit conversion.";
    }
  }

  const handleAddToCart = () => {
    if (!quantity || isNaN(numQty) || numQty <= 0) return;
    if (calculationError) return;

    addItem({
      productId: product.id,
      productName: product.name,
      orderedQuantity: numQty,
      orderedUnit: unit,
      baseQuantity: baseQty,
      pricePerBaseUnit: parseFloat(product.pricePerBaseUnit),
      lineTotalInr: lineTotal,
    });
    
    setOpen(false);
    setQuantity("");
    setUnit(product.baseUnit);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedUnits.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-md border text-sm text-center">
            {quantity && !isNaN(numQty) && numQty > 0 ? (
              calculationError ? (
                <span className="text-red-500 font-medium">{calculationError}</span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500">
                    {numQty} {unit} = {baseQty} {product.baseUnit} × {formatINR(product.pricePerBaseUnit)}/{product.baseUnit}
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    = {formatINR(lineTotal)}
                  </span>
                </div>
              )
            ) : (
              <span className="text-zinc-500">Enter quantity to see total price</span>
            )}
          </div>

          <Button 
            className="w-full h-11 text-base gap-2 bg-blue-600 hover:bg-blue-700" 
            disabled={!quantity || isNaN(numQty) || numQty <= 0 || !!calculationError}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
