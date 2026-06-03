"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const baseUnit = formData.get("baseUnit") as 'g' | 'mL' | 'count';
  const pricePerBaseUnit = formData.get("pricePerBaseUnit") as string;
  const stockQuantity = formData.get("stockQuantity") as string;

  await db.insert(products).values({
    name,
    sku,
    description,
    category,
    baseUnit,
    pricePerBaseUnit,
    stockQuantity,
  });

  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const baseUnit = formData.get("baseUnit") as 'g' | 'mL' | 'count';
  const pricePerBaseUnit = formData.get("pricePerBaseUnit") as string;
  const stockQuantity = formData.get("stockQuantity") as string;

  await db.update(products).set({
    name,
    sku,
    description,
    category,
    baseUnit,
    pricePerBaseUnit,
    stockQuantity,
  }).where(eq(products.id, id));

  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/dashboard");
}
