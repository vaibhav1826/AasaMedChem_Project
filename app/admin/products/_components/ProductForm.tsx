"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProduct, updateProduct } from "../actions";

export function ProductForm({ product }: { product?: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button>+ Add Product</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name} required className="bg-zinc-900 border-zinc-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku} required className="bg-zinc-900 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={product?.category} className="bg-zinc-900 border-zinc-800" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={product?.description} className="bg-zinc-900 border-zinc-800 resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseUnit">Base Unit</Label>
              <Select name="baseUnit" defaultValue={product?.baseUnit || "g"}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="mL">mL</SelectItem>
                  <SelectItem value="count">count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerBaseUnit">Price/Base</Label>
              <Input id="pricePerBaseUnit" name="pricePerBaseUnit" type="number" step="0.0001" defaultValue={product?.pricePerBaseUnit} required className="bg-zinc-900 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Qty</Label>
              <Input id="stockQuantity" name="stockQuantity" type="number" step="0.000001" defaultValue={product?.stockQuantity} required className="bg-zinc-900 border-zinc-800" />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
