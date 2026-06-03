"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toBaseQuantity, calcLineTotal } from "@/lib/units";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

export async function placeOrder(items: any[]) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "seller") {
    throw new Error("Unauthorized");
  }

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Use a transaction to ensure atomicity
  await db.transaction(async (tx) => {
    let totalInr = 0;
    
    // We will build the validated items array
    const validatedItems = [];

    for (const item of items) {
      // Fetch fresh product data from DB
      const [productRecord] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!productRecord) {
        throw new Error(`Product ${item.productName} not found in database.`);
      }

      // Calculate base quantity from client's requested quantity/unit
      const baseQty = toBaseQuantity(item.orderedQuantity, item.orderedUnit);
      
      // Trust ONLY the database price
      const priceSnapshot = parseFloat(productRecord.pricePerBaseUnit);
      
      // Calculate strict line total
      const lineTotalInr = calcLineTotal(baseQty, priceSnapshot);
      
      totalInr += lineTotalInr;

      validatedItems.push({
        productId: productRecord.id,
        orderedQuantity: item.orderedQuantity.toString(),
        orderedUnit: item.orderedUnit,
        baseQuantity: baseQty.toString(),
        pricePerBaseUnitSnapshot: priceSnapshot.toString(),
        lineTotalInr: lineTotalInr.toString()
      });

      // Optional: Strict stock checking (business rule: allow backorders or enforce limit?)
      // We will just subtract and let it go negative if backordered, or we can enforce here:
      // if (parseFloat(productRecord.stockQuantity) < baseQty) throw new Error("Insufficient stock");

      await tx
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${baseQty}`
        })
        .where(eq(products.id, productRecord.id));
    }

    // Insert order
    const [insertedOrder] = await tx
      .insert(orders)
      .values({
        userId: session.user.id,
        status: "pending",
        totalInr: totalInr.toString(),
      })
      .returning();

    // Insert order items
    for (const vItem of validatedItems) {
      await tx.insert(orderItems).values({
        orderId: insertedOrder.id,
        ...vItem
      });
    }
  });
}
