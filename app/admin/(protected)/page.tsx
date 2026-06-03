import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { products, orders } from "@/lib/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { formatINR } from "@/lib/format";
import { Package, ShoppingCart, Clock, IndianRupee } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    [totalProducts],
    [totalOrders],
    [pendingOrders],
    [totalRevenue]
  ] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ value: sum(orders.totalInr) }).from(orders).where(eq(orders.status, "fulfilled"))
  ]);

  const revenueNum = Number(totalRevenue?.value) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400 text-lg">Here's what's happening with your store today.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="group relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Revenue</CardTitle>
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white tracking-tight">{formatINR(revenueNum)}</div>
            <p className="text-xs text-emerald-400/80 mt-2 font-medium">From fulfilled orders</p>
          </CardContent>
        </Card>
        
        {/* Total Orders */}
        <Card className="group relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Orders</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white tracking-tight">{totalOrders.value}</div>
            <p className="text-xs text-blue-400/80 mt-2 font-medium">Orders placed all time</p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="group relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border-white/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Pending Orders</CardTitle>
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white tracking-tight">{pendingOrders.value}</div>
            <p className="text-xs text-amber-400/80 mt-2 font-medium">Requiring fulfillment</p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="group relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-300">Total Products</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white tracking-tight">{totalProducts.value}</div>
            <p className="text-xs text-purple-400/80 mt-2 font-medium">Active items in catalog</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
