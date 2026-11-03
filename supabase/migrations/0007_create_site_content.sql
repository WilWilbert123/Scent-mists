-- 0007_create_site_content.sql
-- SCENTS & MISTS — Editable Site Content Table (Homepage, Brand Story, Banners)

CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL UNIQUE,
  content_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content(content_key);

DROP TRIGGER IF EXISTS trg_site_content_updated_at ON public.site_content;
CREATE TRIGGER trg_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

