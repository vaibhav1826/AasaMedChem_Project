import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function BuyerQuotationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const myQuotations = await db
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Quotations</h1>
        <p className="text-muted-foreground">Track the status of your pricing requests.</p>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500">Quotation ID</TableHead>
              <TableHead className="text-zinc-500">Date Requested</TableHead>
              <TableHead className="text-zinc-500">Items</TableHead>
              <TableHead className="text-zinc-500">Status</TableHead>
              <TableHead className="text-right text-zinc-500">Total INR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myQuotations.map((quotation) => {
              let badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500";
              let badgeText = "AWAITING PRICING";
              if (quotation.status === "confirmed") {
                badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
                badgeText = "PRICED — VIEW DETAILS";
              } else if (quotation.status === "fulfilled") {
                badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500";
                badgeText = "COMPLETED";
              }

              return (
                <TableRow key={quotation.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer relative group">
                  <TableCell className="font-mono text-sm font-medium">
                    <Link href={`/dashboard/buyer/quotations/${quotation.id}`} className="absolute inset-0" />
                    {quotation.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{new Date(quotation.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{Number(quotation.itemCount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 text-xs font-semibold px-2 py-1 ${badgeColor}`}>
                      {badgeText}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {quotation.status === "pending" ? "TBD" : formatINR(quotation.totalInr)}
                  </TableCell>
                </TableRow>
              );
            })}
            {myQuotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                  You haven't requested any quotations yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
