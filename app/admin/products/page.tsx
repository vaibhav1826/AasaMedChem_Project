import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "./_components/ProductForm";
import { DeleteProductButton } from "./_components/DeleteProductButton";
import { formatINR } from "@/lib/format";

export default async function AdminProductsPage() {
  const allProducts = await db.select().from(products);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <ProductForm />
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-950/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">SKU</TableHead>
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-right text-zinc-400">Price/Base</TableHead>
              <TableHead className="text-right text-zinc-400">Stock</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProducts.map((p) => (
              <TableRow key={p.id} className="border-zinc-800 hover:bg-zinc-900/50">
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  {p.category && <Badge variant="outline" className="border-zinc-700">{p.category}</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  {formatINR(p.pricePerBaseUnit)} / {p.baseUnit}
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(p.stockQuantity)} {p.baseUnit}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <ProductForm product={p} />
                  <DeleteProductButton id={p.id} />
                </TableCell>
              </TableRow>
            ))}
            {allProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
