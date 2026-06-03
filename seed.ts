import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './lib/db/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding database...');
  
  // Clear existing data (optional but useful for a fresh seed)
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.users);

  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);

  console.log('Inserting users...');
  const [admin] = await db.insert(schema.users).values({
    email: 'admin@test.com',
    passwordHash: adminPassword,
    role: 'admin',
  }).returning();

  const [seller] = await db.insert(schema.users).values({
    email: 'seller@test.com',
    passwordHash: sellerPassword,
    role: 'seller',
  }).returning();

  console.log('Inserting products...');
  await db.insert(schema.products).values([
    {
      sku: 'WHEAT-50KG',
      name: 'Premium Wheat Flour',
      description: 'High quality whole wheat flour perfect for bakeries.',
      category: 'Grains',
      baseUnit: 'g',
      pricePerBaseUnit: '0.0400', // 40 INR per kg => 0.04 INR per g
      stock: '5000000', // 5000 kg in g
    },
    {
      sku: 'OLIVE-OIL-10L',
      name: 'Extra Virgin Olive Oil',
      description: 'Imported olive oil in bulk packaging.',
      category: 'Oils',
      baseUnit: 'mL',
      pricePerBaseUnit: '0.8000', // 800 INR per L => 0.8 INR per mL
      stock: '200000', // 200 L in mL
    },
    {
      sku: 'CACAO-10KG',
      name: 'Raw Cacao Powder',
      description: 'Organic raw cacao powder.',
      category: 'Baking',
      baseUnit: 'g',
      pricePerBaseUnit: '1.2000', // 1200 INR per kg => 1.2 INR per g
      stock: '100000', // 100 kg in g
    }
  ]);

  console.log('Seeding complete!');
}

seed().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
