import { getOrders, getOrderItems } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminOrdersPage() {
  const orders = await getOrders(); // Admin sees all

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Platform Orders</h1>
      
      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders have been placed yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(async (order) => {
            const items = await getOrderItems(order.id);
            const [user] = await db.select().from(users).where(eq(users.id, order.userId));
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.split('-')[0]}</CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleString()} • Placed by {user?.email}
                      </CardDescription>
                    </div>
                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Ordered Qty</TableHead>
                        <TableHead>Base Qty (Stored)</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.productName} <br/>
                            <span className="text-xs text-muted-foreground">{item.productSku}</span>
                          </TableCell>
                          <TableCell>{item.orderedQuantity} {item.orderedUnit}</TableCell>
                          <TableCell>{item.baseQuantity} base</TableCell>
                          <TableCell className="text-right font-medium">{formatINR(item.lineTotalInr)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <p className="text-lg font-bold">Total: {formatINR(order.totalInr)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
