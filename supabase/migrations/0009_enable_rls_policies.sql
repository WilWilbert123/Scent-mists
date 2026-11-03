-- 0009_enable_rls_policies.sql
-- SCENTS & MISTS — Row Level Security Policies & Storage Buckets

-- Helper function to verify if current authenticated user is a verified ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND role = 'ADMIN'
  );
$$;

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. admin_profiles: Only verified admins can read/update their own profile. No public access.
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND role = 'ADMIN');

CREATE POLICY "Admins can update own profile"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND role = 'ADMIN')
  WITH CHECK (id = auth.uid() AND role = 'ADMIN');

-- 2. products: Public can only read published products; Admins have full CRUD
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. collections: Public can only read published collections; Admins have full CRUD
CREATE POLICY "Public can view published collections"
  ON public.collections FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert collections"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update collections"
  ON public.collections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete collections"
  ON public.collections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 4. enquiries: Public can INSERT enquiries; only Admins can SELECT, UPDATE, DELETE
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 5 AND 160
    AND char_length(subject) BETWEEN 3 AND 140
    AND char_length(message) BETWEEN 10 AND 3000
  );

CREATE POLICY "Admins can view enquiries"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update enquiries"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete enquiries"
  ON public.enquiries FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. visitor_analytics: Public can INSERT validated page views; only Admins can SELECT
CREATE POLICY "Public can insert visitor page views"
  ON public.visitor_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(anonymous_visitor_id) BETWEEN 8 AND 80
    AND char_length(session_id) BETWEEN 8 AND 80
    AND char_length(page_path) BETWEEN 1 AND 200
  );

CREATE POLICY "Admins can read visitor analytics"
  ON public.visitor_analytics FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 6. newsletter_subscribers: Public can INSERT subscription; only Admins can SELECT/UPDATE/DELETE
CREATE POLICY "Public can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(email) BETWEEN 5 AND 160);

CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. site_content: Public can read public site content; Admins can manage
CREATE POLICY "Public can read site content"
  ON public.site_content FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "Admins can manage site content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. audit_logs: Only Admins can read and insert audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('collection-images', 'collection-images', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']),
  ('site-assets', 'site-assets', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read showcase images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id IN ('product-images', 'collection-images', 'site-assets'));

CREATE POLICY "Only admins can upload showcase images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'collection-images', 'site-assets')
    AND public.is_admin()
  );

CREATE POLICY "Only admins can delete showcase images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'collection-images', 'site-assets')
    AND public.is_admin()
  );

