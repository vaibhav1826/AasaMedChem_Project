"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toBaseQuantity } from "@/lib/units";
import { eq } from "drizzle-orm";

export async function requestQuotation(items: any[]) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "buyer") {
    throw new Error("Unauthorized");
  }

  if (!items || items.length === 0) {
    throw new Error("Quotation request is empty");
  }

  await db.transaction(async (tx) => {
    const validatedItems = [];

    for (const item of items) {
      const [productRecord] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!productRecord) {
        throw new Error(`Product ${item.productName} not found in database.`);
      }

      const baseQty = toBaseQuantity(item.orderedQuantity, item.orderedUnit);
      
      validatedItems.push({
        productId: productRecord.id,
        orderedQuantity: item.orderedQuantity.toString(),
        orderedUnit: item.orderedUnit,
        baseQuantity: baseQty.toString(),
        pricePerBaseUnitSnapshot: "0",
        lineTotalInr: "0"
      });
      // NOTE: Stock is NOT deducted during a quotation request, as the order isn't finalized yet.
    }

    // Insert order with totalInr = 0, status = 'pending'
    const [insertedOrder] = await tx
      .insert(orders)
      .values({
        userId: session.user.id,
        status: "pending",
        totalInr: "0",
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
