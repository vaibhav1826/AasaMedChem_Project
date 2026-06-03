import { getProducts } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products & Inventory</h1>
        {/* Placeholder for Add Product button */}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono">{p.sku}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                <TableCell className="text-right">{formatINR(p.pricePerBaseUnit)} / {p.baseUnit}</TableCell>
                <TableCell className="text-right">{parseFloat(p.stockQuantity)} {p.baseUnit}</TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products found. Please seed the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
