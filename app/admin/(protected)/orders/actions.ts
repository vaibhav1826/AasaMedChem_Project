"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { calcLineTotal } from "@/lib/units";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateOrderStatus(
  id: string,
  status: "pending" | "confirmed" | "fulfilled"
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [orderRow] = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalInr: orders.totalInr,
      userRole: users.role,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id));

  if (!orderRow) {
    throw new Error("Order not found");
  }

  if (status === "confirmed") {
    const total = parseFloat(orderRow.totalInr || "0");
    if (orderRow.userRole === "buyer" && total <= 0) {
      throw new Error(
        "Set pricing for buyer quotation requests before marking as confirmed."
      );
    }
  }

  if (status === "fulfilled" && orderRow.status !== "confirmed") {
    throw new Error("Order must be confirmed before it can be fulfilled.");
  }

  await db.update(orders).set({ status }).where(eq(orders.id, id));

  // Buyer quotations do not deduct stock until fulfillment
  if (status === "fulfilled" && orderRow.userRole === "buyer") {
    const items = await db
      .select({
        productId: orderItems.productId,
        baseQuantity: orderItems.baseQuantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    for (const item of items) {
      await db
        .update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} - ${item.baseQuantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    revalidatePath("/admin/products");
    revalidatePath("/dashboard/seller");
    revalidatePath("/dashboard/buyer");
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function confirmQuotationPricing(
  orderId: string,
  itemPrices: { id: string; pricePerBaseUnit: number }[]
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [orderRow] = await db
    .select({ status: orders.status, userRole: users.role })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId));

  if (!orderRow) {
    throw new Error("Order not found");
  }

  if (orderRow.userRole !== "buyer" || orderRow.status !== "pending") {
    throw new Error("This order is not awaiting quotation pricing.");
  }

  if (!itemPrices.length) {
    throw new Error("No line items to price.");
  }

  let orderTotal = 0;

  for (const update of itemPrices) {
    const [item] = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.id, update.id));

    if (!item) throw new Error("Order item not found");

    if (!Number.isFinite(update.pricePerBaseUnit) || update.pricePerBaseUnit < 0) {
      throw new Error("Each price must be a non-negative number.");
    }

    const baseQty = parseFloat(item.baseQuantity);
    const lineTotal = calcLineTotal(baseQty, update.pricePerBaseUnit);
    orderTotal += lineTotal;

    await db
      .update(orderItems)
      .set({
        pricePerBaseUnitSnapshot: update.pricePerBaseUnit.toString(),
        lineTotalInr: lineTotal.toString(),
      })
      .where(eq(orderItems.id, update.id));
  }

  await db
    .update(orders)
    .set({
      status: "confirmed",
      totalInr: orderTotal.toString(),
    })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/buyer/quotations");
}
