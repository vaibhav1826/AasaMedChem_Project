"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { calcLineTotal } from "@/lib/units";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateOrderStatus(id: string, status: "pending" | "confirmed" | "fulfilled") {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.update(orders).set({ status }).where(eq(orders.id, id));

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
  revalidatePath(`/admin/dashboard`);
}

export async function confirmQuotationPricing(orderId: string, itemPrices: { id: string, pricePerBaseUnit: number }[]) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    let orderTotal = 0;

    for (const update of itemPrices) {
      // Fetch the order item to get the base quantity
      const [item] = await tx.select().from(orderItems).where(eq(orderItems.id, update.id));
      
      if (!item) throw new Error("Order item not found");

      const baseQty = parseFloat(item.baseQuantity);
      const lineTotal = calcLineTotal(baseQty, update.pricePerBaseUnit);
      
      orderTotal += lineTotal;

      await tx.update(orderItems)
        .set({
          pricePerBaseUnitSnapshot: update.pricePerBaseUnit.toString(),
          lineTotalInr: lineTotal.toString(),
        })
        .where(eq(orderItems.id, update.id));
    }

    await tx.update(orders)
      .set({
        status: "confirmed",
        totalInr: orderTotal.toString(),
      })
      .where(eq(orders.id, orderId));
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
