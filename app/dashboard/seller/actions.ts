"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  toBaseQuantity,
  calcLineTotal,
  assertUnitCompatible,
  assertPositiveQuantity,
} from "@/lib/units";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CartLineInput = {
  productId: string;
  productName?: string;
  orderedQuantity: number;
  orderedUnit: string;
};

export async function placeOrder(items: CartLineInput[]) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "seller") {
    throw new Error("Unauthorized");
  }

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  let totalInr = 0;
  const validatedItems: {
    productId: string;
    orderedQuantity: string;
    orderedUnit: string;
    baseQuantity: string;
    pricePerBaseUnitSnapshot: string;
    lineTotalInr: string;
  }[] = [];

  // Validate everything before writing (Neon HTTP driver has no transactions)
  for (const item of items) {
    const [productRecord] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (!productRecord) {
      throw new Error(
        `Product ${item.productName ?? item.productId} not found in database.`
      );
    }

    assertPositiveQuantity(item.orderedQuantity);
    assertUnitCompatible(item.orderedUnit, productRecord.baseUnit);

    const baseQty = toBaseQuantity(item.orderedQuantity, item.orderedUnit);
    const stock = parseFloat(productRecord.stockQuantity);

    if (baseQty > stock) {
      throw new Error(
        `Insufficient stock for ${productRecord.name}. Available: ${stock} ${productRecord.baseUnit}`
      );
    }

    const priceSnapshot = parseFloat(productRecord.pricePerBaseUnit);
    const lineTotalInr = calcLineTotal(baseQty, priceSnapshot);
    totalInr += lineTotalInr;

    validatedItems.push({
      productId: productRecord.id,
      orderedQuantity: item.orderedQuantity.toString(),
      orderedUnit: item.orderedUnit,
      baseQuantity: baseQty.toString(),
      pricePerBaseUnitSnapshot: priceSnapshot.toString(),
      lineTotalInr: lineTotalInr.toString(),
    });
  }

  const [insertedOrder] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      totalInr: totalInr.toString(),
    })
    .returning();

  for (const vItem of validatedItems) {
    await db.insert(orderItems).values({
      orderId: insertedOrder.id,
      ...vItem,
    });

    await db
      .update(products)
      .set({
        stockQuantity: sql`${products.stockQuantity} - ${vItem.baseQuantity}`,
      })
      .where(eq(products.id, vItem.productId));
  }

  revalidatePath("/dashboard/seller");
  revalidatePath("/dashboard/seller/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { orderId: insertedOrder.id };
}
