import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './lib/db/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({ path: '.env.local' });
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  try {
    const allUsers = await db.select().from(schema.users);
    console.log("Total users:", allUsers.length);
    for (const u of allUsers) {
      console.log(`User: ${u.email} | Role: ${u.role}`);
      if (u.email === 'admin@test.com') {
        const isValid = await bcrypt.compare('admin123', u.passwordHash);
        console.log(`  Password 'admin123' is valid: ${isValid}`);
      }
    }
  } catch (error) {
    console.error("DB Error:", error);
  }
}

main();
