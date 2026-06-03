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
  
  const existingUsers = await db.select().from(schema.users).limit(1);
  if (existingUsers.length > 0) {
    console.log('Database already contains users. Skipping seed to prevent overwriting.');
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const buyerPassword = await bcrypt.hash('buyer123', 10);

  console.log('Inserting users...');
  await db.insert(schema.users).values({
    email: 'admin@test.com',
    passwordHash: adminPassword,
    role: 'admin',
  });

  await db.insert(schema.users).values({
    email: 'seller@test.com',
    passwordHash: sellerPassword,
    role: 'seller',
  });

  await db.insert(schema.users).values({
    email: 'buyer@test.com',
    passwordHash: buyerPassword,
    role: 'buyer',
  });

  console.log('Inserting products...');
  await db.insert(schema.products).values([
    // Base unit 'g'
    {
      sku: 'NACL-500G',
      name: 'Sodium Chloride',
      description: 'High purity NaCl for laboratory use.',
      category: 'Chemicals',
      baseUnit: 'g',
      pricePerBaseUnit: '0.5000', 
      stockQuantity: '500000', // 500kg in g
    },
    {
      sku: 'C6H12O6-1KG',
      name: 'D-Glucose Anhydrous',
      description: 'Reagent grade glucose.',
      category: 'Chemicals',
      baseUnit: 'g',
      pricePerBaseUnit: '1.2000', 
      stockQuantity: '1000000', // 1000kg in g
    },
    // Base unit 'mL'
    {
      sku: 'ETOH-99-1L',
      name: 'Ethanol Absolute 99.9%',
      description: 'Analytical grade ethanol.',
      category: 'Solvents',
      baseUnit: 'mL',
      pricePerBaseUnit: '2.5000', 
      stockQuantity: '200000', // 200L in mL
    },
    {
      sku: 'HCL-37-2.5L',
      name: 'Hydrochloric Acid 37%',
      description: 'Concentrated HCl.',
      category: 'Acids',
      baseUnit: 'mL',
      pricePerBaseUnit: '1.8000', 
      stockQuantity: '500000', // 500L in mL
    },
    // Base unit 'count'
    {
      sku: 'TIPS-10UL-1000',
      name: 'Pipette Tips 10µL',
      description: 'Box of 1000 sterile micro-pipette tips.',
      category: 'Consumables',
      baseUnit: 'count',
      pricePerBaseUnit: '2.0000', // 2 INR per tip
      stockQuantity: '100000', // 100k tips
    },
    {
      sku: 'TUBE-15ML-50',
      name: 'Centrifuge Tubes 15mL',
      description: 'Pack of 50 sterile conical tubes.',
      category: 'Consumables',
      baseUnit: 'count',
      pricePerBaseUnit: '15.0000', // 15 INR per tube
      stockQuantity: '50000', // 50k tubes
    }
  ]);

  console.log('Seeding complete!');
}

seed().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
