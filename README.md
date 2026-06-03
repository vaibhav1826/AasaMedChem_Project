# AasaMedChem_Project

A full-stack B2B E-commerce platform built with Next.js 14+, Neon PostgreSQL, Drizzle ORM, and NextAuth.

## Architecture & Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Actions)
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js (Credentials, JWT, Role-Based Access Control)
- **Styling**: Tailwind CSS + shadcn/ui

## Key Features & Differentiators

### 1. Robust Unit Conversion Strategy
A critical differentiator in this platform is how we handle physical units (g, kg, mL, L) to prevent floating-point errors and maintain an auditable database.

**Storage Strategy**:
- All weights are stored in **grams (g)**.
- All volumes are stored in **milliliters (mL)**.
- All counts are stored as **integers**.

**Example Conversion**:
When a user orders `1.5 kg` of a product priced at `₹0.04/g`:
1. The system converts `1.5 kg` to `1500 g`.
2. The base quantity (`1500 g`) is multiplied by the base price (`₹0.04/g`).
3. Total calculated: `1500 × 0.04 = ₹60.00`.
4. The database stores: `ordered_quantity=1.5`, `ordered_unit='kg'`, `base_quantity=1500`, `line_total_inr=60.00`.
This allows the Order History to display exactly what the user entered (`1.5 kg`) while the financial math strictly uses the exact `base_quantity` (`1500 g`).

### 2. High Precision Price Storage
All prices and line totals are stored in the database using the `NUMERIC(15,4)` data type instead of `FLOAT` to ensure exact financial calculations in INR without rounding errors. Quantities are stored as `NUMERIC(15,6)`.

## Database Schema Diagram

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Auth & RBAC | `id`, `email`, `role` (admin/seller), `password_hash` |
| `products` | Inventory | `id`, `base_unit` (g/mL/count), `price_per_base_unit`, `stock` |
| `orders` | Order Summaries | `id`, `user_id`, `status`, `total_inr` |
| `order_items`| Line Items | `id`, `order_id`, `product_id`, `ordered_quantity`, `ordered_unit`, `base_quantity`, `line_total_inr` |

## Local Setup

1. **Clone the repository.**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Neon Database URL.
   ```bash
   cp .env.example .env.local
   ```
4. **Push Schema to Database**:
   ```bash
   npm run db:push
   ```
5. **Seed the Database**:
   Populate the database with test users and sample products.
   ```bash
   npm run seed
   ```
6. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Test Credentials

After running the seed script, you can log in with:

**Admin Role**:
- Email: `admin@test.com`
- Password: `admin123`

**Seller Role**:
- Email: `seller@test.com`
- Password: `seller123`

## Implementation Details
- **Unit Conversion**: Found in `lib/units.ts`. Calculations happen entirely on the server via Server Actions before reaching the database.
- **Currency Formatting**: Standardized using `Intl.NumberFormat('en-IN')` in `lib/format.ts`.
- **Middleware**: `middleware.ts` guards the `/admin` and `/dashboard` routes based on JWT session roles.
