"use server";

import { db } from "./db";
import { products, orders, orderItems } from "./db/schema";
import { eq } from "drizzle-orm";
import { toBase, calcLineTotal } from "./units";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getProducts() {
  return db.select().from(products);
}

export async function getProduct(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function placeOrder({ 
  productId, 
  orderedQuantity, 
  orderedUnit 
}: { 
  productId: string; 
  orderedQuantity: number; 
  orderedUnit: string; 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const product = await getProduct(productId);
  if (!product) throw new Error("Product not found");

  // Phase 3 logic: Convert to base before calculation
  const baseQuantity = toBase(orderedQuantity, orderedUnit);
  
  // High precision calculation using NUMERIC logic
  // we do the calc in JS but will store as numeric in postgres
  const lineTotalInr = calcLineTotal(baseQuantity, parseFloat(product.pricePerBaseUnit));

  // Store order
  const [order] = await db.insert(orders).values({
    userId: session.user.id,
    totalInr: lineTotalInr.toString(),
    status: 'completed',
  }).returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    productId: product.id,
    orderedQuantity: orderedQuantity.toString(),
    orderedUnit: orderedUnit,
    baseQuantity: baseQuantity.toString(),
    lineTotalInr: lineTotalInr.toString(),
  });

  // Deduct stock
  const newStock = parseFloat(product.stock) - baseQuantity;
  await db.update(products).set({ stock: newStock.toString() }).where(eq(products.id, product.id));

  return order.id;
}

export async function getOrders() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (session.user.role === 'admin') {
    return db.select().from(orders);
  }

  return db.select().from(orders).where(eq(orders.userId, session.user.id));
}

export async function getOrderItems(orderId: string) {
  return db.select({
    id: orderItems.id,
    orderedQuantity: orderItems.orderedQuantity,
    orderedUnit: orderItems.orderedUnit,
    baseQuantity: orderItems.baseQuantity,
    lineTotalInr: orderItems.lineTotalInr,
    productName: products.name,
    productSku: products.sku,
  })
  .from(orderItems)
  .leftJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, orderId));
}
