import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UpdateStatusButton } from "../_components/UpdateStatusButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order] = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      totalInr: orders.totalInr,
      sellerEmail: users.email,
      buyerRole: users.role,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, params.id));

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

  let badgeColor = "bg-amber-500 hover:bg-amber-600 text-white";
  if (order.status === "confirmed") badgeColor = "bg-blue-500 hover:bg-blue-600 text-white";
  if (order.status === "fulfilled") badgeColor = "bg-emerald-500 hover:bg-emerald-600 text-white";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-xl">Order #{order.id}</CardTitle>
            <CardDescription className="text-zinc-400 mt-2">
              Placed by <span className="text-white font-medium">{order.sellerEmail}</span> 
              <Badge variant="outline" className="mx-2 bg-zinc-800 text-zinc-300 border-zinc-700 uppercase text-[10px]">
                {order.buyerRole}
              </Badge>
              on {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge className={badgeColor + " text-sm px-3 py-1"}>{order.status.toUpperCase()}</Badge>
            <UpdateStatusButton id={order.id} currentStatus={order.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800 bg-zinc-950/50 mt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Product</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ordered Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Base Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Rate Snapshot</TableHead>
                  <TableHead className="text-right text-zinc-400">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell>
                      <div className="font-medium text-white">{item.productName}</div>
                      <div className="text-xs text-zinc-500 mt-1">{item.productSku}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(item.orderedQuantity || "0")} {item.orderedUnit}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">
                      {parseFloat(item.baseQuantity || "0")} {item.baseUnit}
                    </TableCell>
                    <TableCell className="text-right text-zinc-400">
                      {formatINR(item.pricePerBaseUnitSnapshot)} / {item.baseUnit}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {formatINR(item.lineTotalInr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex justify-end">
            <div className="text-xl font-bold bg-zinc-800/50 px-6 py-4 rounded-lg border border-zinc-800">
              Total: <span className="text-emerald-500">{formatINR(order.totalInr)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
