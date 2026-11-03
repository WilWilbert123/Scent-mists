-- 0005_create_visitor_analytics.sql
-- SCENTS & MISTS — Privacy-Conscious Visitor Analytics Table (No IP / No PII)

CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer_category TEXT NOT NULL DEFAULT 'Direct',
  device_category TEXT NOT NULL DEFAULT 'Desktop',
  browser_category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_analytics_created_at ON public.visitor_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_visitor_id ON public.visitor_analytics(anonymous_visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_page_path ON public.visitor_analytics(page_path);

