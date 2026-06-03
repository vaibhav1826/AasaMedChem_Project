import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ProductsClientGrid } from "./_components/ProductsClientGrid";

export default async function DashboardPage() {
  const allProducts = await db.select().from(products);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Available Products</h1>
        <p className="text-muted-foreground">Browse our catalog and place orders directly.</p>
      </div>
      
      <ProductsClientGrid initialProducts={allProducts} />
    </div>
  );
}
