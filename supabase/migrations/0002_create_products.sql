-- 0002_create_products.sql
-- SCENTS & MISTS — Fragrance Showcase Products Table (No Ecommerce / Presentation Only)

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  fragrance_family TEXT NOT NULL,
  top_notes TEXT[] NOT NULL DEFAULT '{}',
  heart_notes TEXT[] NOT NULL DEFAULT '{}',
  base_notes TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  collection_id UUID NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

