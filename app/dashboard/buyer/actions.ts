"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  toBaseQuantity,
  assertUnitCompatible,
  assertPositiveQuantity,
} from "@/lib/units";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type QuotationLineInput = {
  productId: string;
  productName?: string;
  orderedQuantity: number;
  orderedUnit: string;
};

export async function requestQuotation(items: QuotationLineInput[]) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "buyer") {
    throw new Error("Unauthorized");
  }

  if (!items || items.length === 0) {
    throw new Error("Quotation request is empty");
  }

  const validatedItems: {
    productId: string;
    orderedQuantity: string;
    orderedUnit: string;
    baseQuantity: string;
    pricePerBaseUnitSnapshot: string;
    lineTotalInr: string;
  }[] = [];

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

    validatedItems.push({
      productId: productRecord.id,
      orderedQuantity: item.orderedQuantity.toString(),
      orderedUnit: item.orderedUnit,
      baseQuantity: baseQty.toString(),
      pricePerBaseUnitSnapshot: "0",
      lineTotalInr: "0",
    });
  }

  const [insertedOrder] = await db
    .insert(orders)
    .values({
      userId: session.user.id,
      status: "pending",
      totalInr: "0",
    })
    .returning();

  for (const vItem of validatedItems) {
    await db.insert(orderItems).values({
      orderId: insertedOrder.id,
      ...vItem,
    });
  }

  revalidatePath("/dashboard/buyer");
  revalidatePath("/dashboard/buyer/quotations");
  revalidatePath("/admin/orders");

  return { orderId: insertedOrder.id };
}
