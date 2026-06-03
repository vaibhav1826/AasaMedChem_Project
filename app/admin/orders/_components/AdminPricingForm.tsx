"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { confirmQuotationPricing } from "../actions";

export function AdminPricingForm({ orderId, items }: { orderId: string, items: any[] }) {
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, string>>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: "" }), {})
  );

  const handlePriceChange = (id: string, val: string) => {
    setPrices((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates = items.map((item) => {
      const p = parseFloat(prices[item.id]);
      if (isNaN(p) || p < 0) {
        throw new Error("Invalid price for " + item.productName);
      }
      return {
        id: item.id,
        pricePerBaseUnit: p
      };
    });

    try {
      await confirmQuotationPricing(orderId, updates);
    } catch (err: any) {
      alert(err.message || "Failed to confirm pricing");
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 mt-8">
      <CardHeader>
        <CardTitle className="text-white">Set Pricing (Quotation Request)</CardTitle>
        <CardDescription className="text-emerald-500">
          This order was placed by a buyer and requires manual pricing. Set the price per base unit for each item.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-md border border-zinc-800 bg-zinc-950">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Product</TableHead>
                  <TableHead className="text-zinc-400 text-right">Requested Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Base Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Price per Base Unit (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-zinc-800">
                    <TableCell>
                      <div className="font-medium text-white">{item.productName}</div>
                      <div className="text-xs text-zinc-500">{item.productSku}</div>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {parseFloat(item.orderedQuantity)} {item.orderedUnit}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {parseFloat(item.baseQuantity)} {item.baseUnit}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-zinc-500">₹</span>
                        <Input 
                          type="number"
                          step="any"
                          min="0"
                          required
                          className="w-24 bg-zinc-900 border-zinc-700 text-white"
                          value={prices[item.id]}
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        />
                        <span className="text-zinc-500">/ {item.baseUnit}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Confirming..." : "Confirm & Send Pricing"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
