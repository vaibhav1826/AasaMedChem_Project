import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [dbUser] = await db.select().from(users).where(eq(users.email, credentials.email));
        let user = dbUser;

        if (!user) {
          // Auto-seed test users if they don't exist in the current database (e.g. fresh Vercel deploy)
          if (credentials.email === "admin@test.com" && credentials.password === "admin123") {
            const hash = await bcrypt.hash("admin123", 10);
            const [newAdmin] = await db.insert(users).values({ email: "admin@test.com", passwordHash: hash, role: "admin" }).returning();
            user = newAdmin;
          } else if (credentials.email === "seller@test.com" && credentials.password === "seller123") {
            const hash = await bcrypt.hash("seller123", 10);
            const [newSeller] = await db.insert(users).values({ email: "seller@test.com", passwordHash: hash, role: "seller" }).returning();
            user = newSeller;
          } else if (credentials.email === "buyer@test.com" && credentials.password === "buyer123") {
            const hash = await bcrypt.hash("buyer123", 10);
            const [newBuyer] = await db.insert(users).values({ email: "buyer@test.com", passwordHash: hash, role: "buyer" }).returning();
            user = newBuyer;
          } else {
            return null;
          }
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "seller" | "buyer";
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-32-chars-long",
};
