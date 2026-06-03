"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartItem } from "./_components/CartContext";

export async function placeOrder(items: Omit<CartItem, "id">[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!items || items.length === 0) {
    throw new Error("No items to order");
  }

  // Calculate total order cost
  const totalInr = items.reduce((sum, item) => sum + item.lineTotalInr, 0);

  // We perform this transactionally by utilizing promises and checking sequentially or using db.transaction if supported
  // Drizzle neon-http supports transactions
  return await db.transaction(async (tx) => {
    // 1. Create order
    const [order] = await tx.insert(orders).values({
      userId: session.user.id,
      totalInr: totalInr.toString(),
      status: "pending",
    }).returning();

    // 2. Add all items & update stock
    for (const item of items) {
      // Fetch product to verify and update stock
      const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!product) {
        throw new Error(`Product ${item.productName} not found`);
      }

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: product.id,
        orderedQuantity: item.orderedQuantity.toString(),
        orderedUnit: item.orderedUnit,
        baseQuantity: item.baseQuantity.toString(),
        pricePerBaseUnitSnapshot: product.pricePerBaseUnit,
        lineTotalInr: item.lineTotalInr.toString(),
      });

      // Update stock
      const currentStock = parseFloat(product.stockQuantity);
      if (currentStock < item.baseQuantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const newStock = currentStock - item.baseQuantity;
      await tx.update(products).set({ stockQuantity: newStock.toString() }).where(eq(products.id, product.id));
    }

    return order.id;
  });
}
