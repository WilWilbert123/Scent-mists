-- 0006_create_newsletter_subscribers.sql
-- SCENTS & MISTS — Newsletter Subscribers Table

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_subscribed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON public.newsletter_subscribers(is_subscribed);

DROP TRIGGER IF EXISTS trg_newsletter_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

