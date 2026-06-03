"use server";

import { db } from "./db";
import { products, orders, orderItems, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { toBaseQuantity, calcLineTotal } from "./units";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import bcrypt from "bcrypt";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawRole = formData.get("role") as string;

  if (!email || !password) {
    throw new Error("Missing email or password");
  }

  const role = rawRole === "seller" ? "seller" : "buyer"; // secure default and validation

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    passwordHash,
    role,
  });

  return { success: true };
}

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
  const baseQuantity = toBaseQuantity(orderedQuantity, orderedUnit);
  
  // High precision calculation using NUMERIC logic
  // we do the calc in JS but will store as numeric in postgres
  const lineTotalInr = calcLineTotal(baseQuantity, parseFloat(product.pricePerBaseUnit));

  // Store order
  const [order] = await db.insert(orders).values({
    userId: session.user.id,
    totalInr: lineTotalInr.toString(),
    status: 'pending',
  }).returning();

  await db.insert(orderItems).values({
    orderId: order.id,
    productId: product.id,
    orderedQuantity: orderedQuantity.toString(),
    orderedUnit: orderedUnit,
    baseQuantity: baseQuantity.toString(),
    pricePerBaseUnitSnapshot: product.pricePerBaseUnit,
    lineTotalInr: lineTotalInr.toString(),
  });

  // Deduct stock
  const newStock = parseFloat(product.stockQuantity) - baseQuantity;
  await db.update(products).set({ stockQuantity: newStock.toString() }).where(eq(products.id, product.id));

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
