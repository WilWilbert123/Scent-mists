-- 0003_create_collections.sql
-- SCENTS & MISTS — Curated Fragrance Collections Table

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_published ON public.collections(is_published);

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS fk_products_collection;

ALTER TABLE public.products
  ADD CONSTRAINT fk_products_collection
  FOREIGN KEY (collection_id)
  REFERENCES public.collections(id)
  ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_collections_updated_at ON public.collections;
CREATE TRIGGER trg_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

