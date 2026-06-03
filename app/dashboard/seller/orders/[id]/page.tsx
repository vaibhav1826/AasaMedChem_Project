import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SellerOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, params.id), eq(orders.userId, session.user.id)));

  if (!order) {
    notFound();
  }

  const items = await db
    .select({
      id: orderItems.id,
      orderedQuantity: orderItems.orderedQuantity,
      orderedUnit: orderItems.orderedUnit,
      baseQuantity: orderItems.baseQuantity,
      lineTotalInr: orderItems.lineTotalInr,
      pricePerBaseUnitSnapshot: orderItems.pricePerBaseUnitSnapshot,
      productName: products.name,
      productSku: products.sku,
      baseUnit: products.baseUnit,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  let badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500";
  if (order.status === "confirmed") badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
  if (order.status === "fulfilled") badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/seller/orders" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
      </div>

      <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-xl">Order #{order.id}</CardTitle>
            <CardDescription className="mt-2">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`border-0 text-sm px-3 py-1 ${badgeColor}`}>
            {order.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500">Product</TableHead>
                  <TableHead className="text-zinc-500 text-right">Ordered Qty</TableHead>
                  <TableHead className="text-zinc-500 text-right">Base Qty</TableHead>
                  <TableHead className="text-zinc-500 text-right">Rate Snapshot</TableHead>
                  <TableHead className="text-right text-zinc-500">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900">
                    <TableCell>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-zinc-500 mt-1">{item.productSku}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(item.orderedQuantity || "0")} {item.orderedUnit}
                    </TableCell>
                    <TableCell className="text-right text-zinc-500">
                      {parseFloat(item.baseQuantity || "0")} {item.baseUnit}
                    </TableCell>
                    <TableCell className="text-right text-zinc-500">
                      {formatINR(item.pricePerBaseUnitSnapshot)} / {item.baseUnit}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatINR(item.lineTotalInr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex justify-end">
            <div className="text-xl font-bold bg-zinc-100 dark:bg-zinc-900 px-6 py-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
              Total: <span className="text-blue-600 dark:text-blue-400">{formatINR(order.totalInr)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
