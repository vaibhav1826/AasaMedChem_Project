import { getProducts } from "@/lib/actions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Available Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{p.name}</CardTitle>
                <Badge variant="outline">{p.category}</Badge>
              </div>
              <CardDescription>SKU: {p.sku}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <p className="font-semibold text-lg">{formatINR(p.pricePerBaseUnit)} <span className="text-sm font-normal text-muted-foreground">/ {p.baseUnit}</span></p>
                <p className="text-sm text-muted-foreground mt-1">
                  In Stock: {parseFloat(p.stock)} {p.baseUnit}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/products/${p.id}`} className="w-full">
                <Button className="w-full">Order Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
