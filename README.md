# CajaLibre

Inventory, point of sale, and cash register closing (cierre de caja). Built with **Next.js**, **Supabase**, and a pragmatic hexagonal architecture ready to scale to multiple locations.

## Features (MVP)

- **Authentication** — staff login via Supabase Auth
- **Multi-gym ready** — `gym_id` on all data, RLS policies, role-based access
- **Inventory** — products, stock levels, low-stock alerts, manual adjustments
- **Point of Sale** — cart-based sales with cash / card / transfer
- **Cash register** — open session, track sales, cash in/out, close with variance
- **Dashboard** — today's sales, open register status, quick actions

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Backend | Supabase Postgres + RLS + RPC functions |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Validation | Zod |
| Architecture | Domain → Application services → Supabase adapters |

## Project structure

```
src/
├── app/                    # Routes & Server Actions
├── application/            # Use cases (product, register, dashboard)
├── domain/                 # Pure business logic (entities, rules)
├── infrastructure/supabase/ # DB client, mappers, types
├── components/             # UI components
└── lib/                    # Auth context, validation schemas
supabase/
├── migrations/             # SQL schema + RLS + RPC
└── seed.sql                # Demo org, gym, products
```

## Setup

### 0. Node.js

Use **Node 22 LTS** (recommended). If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

Minimum supported version: **Node 20.9+** (required by Next.js 16).

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

### 3. Run database migrations

**Option A — Supabase Dashboard**

1. Open **SQL Editor** in your Supabase project
2. Run the contents of `supabase/migrations/20260303000000_initial_schema.sql`
3. Run `supabase/seed.sql` (creates demo org, gym, and sample products)

**Option B — Supabase CLI**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
psql $DATABASE_URL -f supabase/seed.sql
```

### 4. Create your admin user

1. In Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Create a user with email + password
3. Copy the user's UUID
4. Run this SQL (replace `YOUR_USER_ID`):

```sql
insert into user_gym_memberships (user_id, gym_id, role)
values (
  'YOUR_USER_ID',
  '22222222-2222-2222-2222-222222222222',
  'admin'
);
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin user.

## Demo walkthrough (for client)

1. **Dashboard** — overview of today's activity
2. **Cash Register** → Open register with opening cash (e.g. $100)
3. **Inventory** — review products (6 sample items seeded)
4. **Point of Sale** — sell items, choose payment method
5. **Cash Register** → Close register, enter counted cash, review variance
6. **Inventory** — verify stock decremented after sales

## Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, manage gyms (future) |
| `manager` | Products, stock, close register |
| `cashier` | Open register, process sales |

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Scaling to multiple gyms

The schema already supports multiple gyms under one organization. To add a second location:

1. Insert a new row in `gyms`
2. Assign staff via `user_gym_memberships`
3. RLS automatically isolates data per gym

A gym switcher in the UI can be added when you onboard location #2.

## License

Private — CajaLibre
