import Link from "next/link";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const allOrders = await db
    .select({
      id: orders.id,
      createdAt: orders.createdAt,
      status: orders.status,
      totalInr: orders.totalInr,
      sellerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Global Orders</h1>

      <div className="rounded-md border border-zinc-800 bg-zinc-950/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Order ID</TableHead>
              <TableHead className="text-zinc-400">Seller Email</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-400">Total INR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allOrders.map((order) => {
              let badgeColor = "bg-amber-500 hover:bg-amber-600 text-white";
              if (order.status === "confirmed") badgeColor = "bg-blue-500 hover:bg-blue-600 text-white";
              if (order.status === "fulfilled") badgeColor = "bg-emerald-500 hover:bg-emerald-600 text-white";

              return (
                <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-900/50 cursor-pointer relative group">
                  <TableCell className="font-mono text-sm font-medium">
                    <Link href={`/admin/orders/${order.id}`} className="absolute inset-0" />
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{order.sellerEmail}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={badgeColor}>{order.status.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatINR(order.totalInr)}
                  </TableCell>
                </TableRow>
              );
            })}
            {allOrders.length === 0 && (
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
