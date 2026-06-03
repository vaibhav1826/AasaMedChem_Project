# AasaMedChem — Inventory & Order Management

A B2B inventory and order management system built for the AasaMedChem hackathon assignment. Sellers place priced orders with live unit conversion; buyers request quotations without list prices; admins manage products, inventory, and order/quotation workflows.

## Live deployment

Deploy to [Vercel](https://vercel.com) with a [Neon](https://neon.tech) PostgreSQL database. After deploying, add your production URL to the Google Form submission.

**Suggested Vercel setup:** Import the GitHub repo → add environment variables → deploy. Set `NEXTAUTH_URL` to your production domain (e.g. `https://your-app.vercel.app`).

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/Base UI |
| Backend | Next.js Server Actions, NextAuth.js (JWT, credentials) |
| Database | Neon PostgreSQL (serverless HTTP driver) |
| ORM | Drizzle ORM |
| Hosting | Vercel |

## Roles & panels

| Role | Login | Capabilities |
|------|-------|----------------|
| **Admin** | `/admin/login` | CRUD products, view inventory, manage all orders/quotations, set buyer quotation pricing |
| **Seller** | `/login` | Browse catalog with INR prices, search/filter, cart checkout with unit conversion |
| **Buyer** | `/login` | Browse catalog (no prices), submit quotation requests, view admin-confirmed pricing |

Sellers and buyers share `/login`; middleware routes each role to the correct dashboard.

## Core flows

### Seller order flow
1. Sign in → `/dashboard/seller`
2. Search/filter products, add to **Order Cart**
3. Set quantity in **g/kg**, **mL/L**, or **count** (per product type)
4. Review live line totals (INR) and base-unit conversion preview
5. **Place Order** → order appears in seller history and admin orders (status: pending → confirmed → fulfilled)

### Buyer quotation flow
1. Sign in as buyer → `/dashboard/buyer`
2. Add products to **Quotation Request** with desired quantities/units
3. Submit → admin sees request with TBD pricing
4. Admin sets price per base unit on order detail → **Confirm & Send Pricing**
5. Buyer sees confirmed totals in `/dashboard/buyer/quotations`

### Admin product management
- `/admin/products` — create/edit/delete products with base unit (g, mL, count), price per base unit (₹), and stock in base units

## Unit storage & conversion strategy

### Internal storage (database)
| Dimension | Base unit stored | UI units allowed |
|-----------|------------------|------------------|
| Weight | **grams (g)** | g, kg |
| Volume | **milliliters (mL)** | mL, L |
| Count | **count** | count |

**Conversion factors** (`lib/units.ts`):
- 1 kg = 1000 g  
- 1 L = 1000 mL  
- count = 1  

### Where conversions run
1. **Client (cart UI):** preview `baseQuantity` and line totals while editing  
2. **Server (actions):** authoritative conversion via `toBaseQuantity()` before insert; prices computed with `calcLineTotal(baseQty, pricePerBaseUnit)`  
3. **Display:** order history shows both `ordered_quantity` + `ordered_unit` and stored `base_quantity` for auditability  

### Prices & quantities (PostgreSQL types)
| Field | Type | Rationale |
|-------|------|-----------|
| `price_per_base_unit`, `total_inr`, `line_total_inr` | `NUMERIC(15,4)` | Exact INR math, no float drift |
| `stock_quantity`, `base_quantity`, `ordered_quantity` | `NUMERIC(15,6)` | High-precision quantities |

**Display:** `Intl.NumberFormat('en-IN')` in `lib/format.ts` for ₹ formatting.

**Stock rules:**
- Seller orders: stock decremented when order is placed  
- Buyer quotations: stock decremented when admin marks order **fulfilled** (after pricing is confirmed)  

> **Note:** The Neon HTTP driver does not support SQL transactions. Server actions validate all lines before writing to minimize partial updates.

## Database schema

```text
users
  id              UUID PK
  email           TEXT UNIQUE
  password_hash   TEXT
  role            ENUM(admin, seller, buyer)
  created_at      TIMESTAMPTZ

products
  id                    UUID PK
  sku                   TEXT UNIQUE
  name, description, category
  base_unit             ENUM(g, mL, count)
  price_per_base_unit   NUMERIC(15,4)
  stock_quantity        NUMERIC(15,6)
  created_at            TIMESTAMPTZ

orders
  id          UUID PK
  user_id     UUID FK → users
  status      ENUM(pending, confirmed, fulfilled)
  total_inr   NUMERIC(15,4)
  created_at  TIMESTAMPTZ

order_items
  id                           UUID PK
  order_id                     UUID FK → orders
  product_id                   UUID FK → products
  ordered_quantity             NUMERIC(15,6)
  ordered_unit                 TEXT
  base_quantity                NUMERIC(15,6)
  price_per_base_unit_snapshot NUMERIC(15,4)
  line_total_inr               NUMERIC(15,4)
```

Full Drizzle definitions: `lib/db/schema.ts`.

## Local setup

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Environment** — copy `.env.example` to `.env.local`:
   ```env
   DATABASE_URL=postgresql://...neon...
   NEXTAUTH_SECRET=your-random-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Push schema & seed**
   ```bash
   npm run db:push
   npm run seed
   ```

4. **Run dev server**
   ```bash
   npm run dev
   ```

## Deploy / redeploy on Vercel

1. Push code to GitHub  
2. Import project in Vercel  
3. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (production URL)  
4. Deploy — run `db:push` and `seed` against production Neon once (via local CLI with prod `DATABASE_URL`, or Neon SQL console)  
5. Redeploy after env or code changes from the Vercel dashboard or git push  

## Test credentials

After `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `admin123` |
| Seller | `seller@test.com` | `seller123` |
| Buyer | `buyer@test.com` | `buyer123` |

**Register:** `/register` creates new **seller** accounts only.

## Project structure

```text
app/
  admin/          Admin panel (products, orders, users)
  dashboard/
    seller/       Catalog, cart, orders
    buyer/        Catalog, quotations
  login/          Seller & buyer login
lib/
  units.ts        Conversion & pricing math
  format.ts       INR formatting
  db/schema.ts    Drizzle schema
middleware.ts     Role-based route protection
seed.ts           Sample users & products
```

## Key implementation files

- `lib/units.ts` — conversion factors and line total calculation  
- `app/dashboard/seller/actions.ts` — priced orders with stock checks  
- `app/dashboard/buyer/actions.ts` — quotation requests  
- `app/admin/orders/actions.ts` — status updates and quotation pricing  
- `middleware.ts` — RBAC for `/admin`, `/dashboard/seller`, `/dashboard/buyer`  
