import { pgTable, text, timestamp, numeric, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'seller'] }).notNull().default('seller'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  baseUnit: text('base_unit', { enum: ['g', 'mL', 'count'] }).notNull(),
  pricePerBaseUnit: numeric('price_per_base_unit', { precision: 15, scale: 4 }).notNull(),
  stockQuantity: numeric('stock_quantity', { precision: 15, scale: 6 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'fulfilled'] }).notNull().default('pending'),
  totalInr: numeric('total_inr', { precision: 15, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  orderedQuantity: numeric('ordered_quantity', { precision: 15, scale: 6 }).notNull(),
  orderedUnit: text('ordered_unit').notNull(),
  baseQuantity: numeric('base_quantity', { precision: 15, scale: 6 }).notNull(),
  pricePerBaseUnitSnapshot: numeric('price_per_base_unit_snapshot', { precision: 15, scale: 4 }).notNull(),
  lineTotalInr: numeric('line_total_inr', { precision: 15, scale: 4 }).notNull(),
});
