import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { products, orders } from "@/lib/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { Package, ShoppingCart, Clock, IndianRupee } from "lucide-react";

export default async function AdminDashboardPage() {
  const [totalProducts] = await db.select({ value: count() }).from(products);
  const [totalOrders] = await db.select({ value: count() }).from(orders);
  
  const [pendingOrders] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));
    
  const [totalRevenue] = await db
    .select({ value: sum(orders.totalInr) })
    .from(orders)
    .where(eq(orders.status, "fulfilled"));

  const revenueNum = Number(totalRevenue?.value) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatINR(revenueNum)}</div>
            <p className="text-xs text-zinc-500 mt-1">From fulfilled orders</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalOrders.value}</div>
            <p className="text-xs text-zinc-500 mt-1">Orders placed all time</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingOrders.value}</div>
            <p className="text-xs text-zinc-500 mt-1">Requiring fulfillment</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalProducts.value}</div>
            <p className="text-xs text-zinc-500 mt-1">Active items in catalog</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
