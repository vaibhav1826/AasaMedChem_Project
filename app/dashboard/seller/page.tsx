import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ProductGrid } from "./_components/ProductGrid";

export default async function SellerProductsPage() {
  const allProducts = await db.select().from(products);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products Catalog</h1>
        <p className="text-muted-foreground">Browse our catalog and request items for quoting.</p>
      </div>
      
      <ProductGrid initialProducts={allProducts} />
    </div>
  );
}
