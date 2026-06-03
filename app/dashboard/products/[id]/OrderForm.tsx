"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { toBase, calcLineTotal } from "@/lib/units";
import { placeOrder } from "@/lib/actions";

export default function OrderForm({ product }: { product: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [qty, setQty] = useState<string>("1");
  const [unit, setUnit] = useState<string>(product.baseUnit === 'g' ? 'kg' : product.baseUnit === 'mL' ? 'L' : 'count');
  const [error, setError] = useState("");

  const availableUnits = product.baseUnit === 'g' ? ['g', 'kg'] : product.baseUnit === 'mL' ? ['mL', 'L'] : ['count'];

  const calculation = useMemo(() => {
    const numQty = parseFloat(qty);
    if (isNaN(numQty) || numQty <= 0) return null;

    try {
      const baseQty = toBase(numQty, unit);
      const lineTotal = calcLineTotal(baseQty, parseFloat(product.pricePerBaseUnit));
      return { baseQty, lineTotal };
    } catch (e) {
      return null;
    }
  }, [qty, unit, product.pricePerBaseUnit, product.baseUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numQty = parseFloat(qty);
    if (isNaN(numQty) || numQty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (calculation && calculation.baseQty > parseFloat(product.stockQuantity)) {
      setError("Insufficient stock available.");
      return;
    }

    startTransition(async () => {
      try {
        await placeOrder({
          productId: product.id,
          orderedQuantity: numQty,
          orderedUnit: unit,
        });
        router.push("/dashboard/orders");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to place order.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order {product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input 
                id="qty"
                type="number" 
                step="any"
                min="0.0001"
                value={qty} 
                onChange={(e) => setQty(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Calculation Details</h4>
            {calculation ? (
              <>
                <p className="text-sm">
                  You ordered: <span className="font-medium">{qty} {unit}</span>
                </p>
                <p className="text-sm">
                  Converted to base: <span className="font-medium">{calculation.baseQty} {product.baseUnit}</span>
                </p>
                <p className="text-sm">
                  Base Price: <span className="font-medium">{formatINR(product.pricePerBaseUnit)} / {product.baseUnit}</span>
                </p>
                <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xl font-bold text-primary">
                    Total: {formatINR(calculation.lineTotal)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Enter a valid quantity to see the total.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <Button type="submit" className="w-full" disabled={isPending || !calculation}>
            {isPending ? "Placing Order..." : "Confirm Purchase"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
