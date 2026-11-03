# SCENTS & MISTS — Himalayan Cherry Blossom Air

Luxury perfume showcase website and separate, role-protected administrator dashboard built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **React Three Fiber / Three.js**, **Framer Motion**, **Recharts**, and **Supabase** (PostgreSQL, Auth, Storage, Row Level Security, and Realtime).

> **Note:** SCENTS & MISTS is a luxury fragrance showcase and brand portal—not an ecommerce store. It intentionally omits shopping carts, checkout flows, payment gateways, and order processing in favor of bespoke fragrance exploration, editorial storytelling, private customer enquiries, and real-time administrator analytics.

---

## 1. Design Direction & Theme System

- **Brand Concept:** *Himalayan Cherry Blossom Air* ("Where Cherry Blossoms Meet the Himalayan Mist.")
- **Typography:** `Cormorant Garamond` for editorial headings and `Inter` for body copy, controls, and dashboard interfaces.
- **Light Mode (Default):** Warm ivory (`#FAF8F4`), soft cream (`#F3EEE8`), cherry blossom pink (`#E8C6CE`), muted rose (`#B98792`), sage (`#A6B1A0`), charcoal (`#242322`), and soft white (`#FFFFFF`).
- **Dark Mode:** Deep charcoal (`#171615`), dark atmospheric background (`#201D1C`), muted rose (`#B98792`), soft blush (`#D8B7C0`), warm ivory text (`#F5F0EB`), and muted gray (`#A9A19B`).
- **FOUC-Free Theme Persistence:** Synchronized `<meta name="color-scheme" content="light dark">` and an inline `<head>` script apply the stored theme preference prior to first paint.

---

## 2. Public Routes & Administrator Routes

### Public Showcase Routes
- `/` — Luxury homepage with editable announcement bar, atmospheric hero section, interactive 3D perfume bottle (`React Three Fiber`), brand introduction, featured *Himalayan Cherry Blossom Air* showcase, three-tier fragrance notes pyramid, scent experience, botanical ingredients, editorial lifestyle gallery, fragrance collections, sample testimonials (with explicit sample disclaimers), newsletter subscription, and private enquiry section.
- `/shop` — Filterable fragrance showcase gallery (informational only; no ecommerce cart/checkout).
- `/collections` & `/collections/[slug]` — Curated botanical collections.
- `/products/[slug]` — Detailed fragrance dossier with olfactory pyramid, gallery, and bespoke enquiry form.
- `/about` — Brand story, philosophy, and high-altitude distillation heritage.
- `/fragrance-guide` — Interactive guide to fragrance concentrations, olfactory families, and layering rituals.
- `/contact` — Private fragrance concierge enquiry portal.
- `/privacy` — Privacy policy detailing cookie-minimal anonymous visitor analytics and enquiry data handling.

### Separate Administrator Portal (Hidden from Public Navigation)
- `/admin/login` — Secure administrator authentication with email/password, password reset request flow, and rate-limited server validation.
- `/admin/unauthorized` — Role verification boundary for non-admin accounts.
- `/admin` — Executive overview with live Supabase connection indicator, real KPI cards (never fake/hardcoded numbers), visitor overview chart, enquiry status distribution, top pages, and recent enquiries.
- `/admin/analytics` — Traffic trends, date range filter (`today`, `7d`, `30d`, `90d`, `12m`), traffic source breakdown, device/browser distribution, and CSV export.
- `/admin/visitors` — Privacy-conscious anonymous visitor session log (`visitor_analytics`) with distinct page views vs. unique visitors.
- `/admin/enquiries` & `/admin/enquiries/[id]` — Full enquiry lifecycle management (`NEW`, `PENDING`, `CONTACTED`, `RESOLVED`, `ARCHIVED`), internal notes, search/filter, and CSV export.
- `/admin/products`, `/admin/products/create`, `/admin/products/[id]/edit` — Fragrance CRUD and Supabase Storage image upload.
- `/admin/collections` & `/admin/collections/create` — Collection management.
- `/admin/content`, `/admin/content/homepage`, `/admin/content/banners`, `/admin/content/brand-story` — Live CMS for announcement bar, hero copy, and brand story.
- `/admin/newsletter` — Newsletter subscriber registry and CSV export.
- `/admin/audit-logs` — Immutable administrator activity log (`audit_logs`).
- `/admin/settings`, `/admin/settings/profile`, `/admin/settings/security`, `/admin/settings/appearance` — Administrator profile, password rotation, and theme preferences.

---

## 3. Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Exposure | Description |
| :--- | :---: | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public | Canonical site URL (e.g. `http://localhost:3000` or `https://scentsandmists.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Your Supabase project URL (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Your Supabase `anon` public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server-Only** | Your Supabase `service_role` secret key (never exposed to browser code) |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Server-Only | Destination email for new customer enquiry notifications |

---

## 4. Supabase Database Setup & Migrations

All SQL migrations are located in `supabase/migrations/`:

1. `0001_create_admin_profiles.sql` — `admin_profiles` table (`id`, `email`, `full_name`, `role`) + `public.is_admin()` security definer function.
2. `0002_create_products.sql` — `products` table for fragrance showcase items.
3. `0003_create_collections.sql` — `collections` table and foreign key link to `products`.
4. `0004_create_enquiries.sql` — `enquiries` table with status workflow (`NEW`, `PENDING`, `CONTACTED`, `RESOLVED`, `ARCHIVED`).
5. `0005_create_visitor_analytics.sql` — `visitor_analytics` table storing anonymous visitor ID, session ID, page path, referrer category, device category, and browser category.
6. `0006_create_newsletter_subscribers.sql` — `newsletter_subscribers` table.
7. `0007_create_homepage_content.sql` — `homepage_content` JSONB key-value CMS store.
8. `0008_create_audit_logs.sql` — `audit_logs` table for administrator actions.
9. `0009_enable_rls_policies.sql` — Row Level Security policies across all tables plus Supabase Storage buckets (`product-images`, `collection-images`, `homepage-banners`, `brand-assets`).
10. `0010_create_analytics_functions.sql` — PostgreSQL RPC helper `get_analytics_overview` for fast dashboard aggregation.

### Applying Migrations & Seed Data

Using the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or run the SQL files in `supabase/migrations/0001_*.sql` through `0010_*.sql` followed by `supabase/seed.sql` directly inside the **Supabase Dashboard SQL Editor**.

---

## 5. Creating the First Administrator Account Securely

Public administrator registration is intentionally disabled. To provision your first administrator:

1. Open your **Supabase Dashboard -> Authentication -> Users** and click **Add User -> Create New User**.
2. Enter your administrator email and a strong password, and check **Auto Confirm User**.
3. Copy the newly created User `UUID`.
4. Open the **Supabase SQL Editor** and insert the corresponding `admin_profiles` row:

```sql
INSERT INTO public.admin_profiles (id, email, full_name, role)
VALUES (
  'YOUR-AUTH-USER-UUID-HERE',
  'concierge@scentsandmists.com',
  'Archival Director',
  'ADMIN'
)
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', updated_at = timezone('utc', now());
```

5. Navigate to `/admin/login` and sign in with your credentials.

---

## 6. Local Development & Testing

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server at http://localhost:3000
npm run dev

# Run TypeScript type checking
npm run typecheck

# Run Vitest unit & integration tests
npm test

# Run production build
npm run build

# Run Playwright E2E tests
npm run test:e2e
```

---

## 7. Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project into **Vercel**.
3. In **Vercel Project Settings -> Environment Variables**, configure:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_NOTIFICATION_EMAIL`
4. Deploy. Next.js App Router server actions, route handlers, and middleware will automatically run on Vercel's serverless runtime.

#   S c e n t - m i s t s  
 