import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Fetch orders for this seller, plus count the items
  const sellerOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      totalInr: orders.totalInr,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.userId, session.user.id))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Order History</h1>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 dark:text-zinc-400">Order ID</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Items</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Total INR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellerOrders.map((order) => {
              let badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500";
              if (order.status === "confirmed") badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
              if (order.status === "fulfilled") badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500";

              return (
                <TableRow key={order.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer relative group">
                  <TableCell className="font-mono text-sm font-medium">
                    <Link href={`/dashboard/seller/orders/${order.id}`} className="absolute inset-0" />
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{Number(order.itemCount)} items</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${badgeColor}`}>{order.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(order.totalInr)}
                  </TableCell>
                </TableRow>
              );
            })}
            {sellerOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
