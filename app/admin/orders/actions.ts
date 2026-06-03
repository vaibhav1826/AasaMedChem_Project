"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
