-- 0010_create_analytics_functions.sql
-- SCENTS & MISTS — Database Analytics Aggregation Functions & Realtime Setup

CREATE OR REPLACE FUNCTION public.get_visitor_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_page_views BIGINT,
  unique_visitors BIGINT,
  total_sessions BIGINT,
  visitors_today BIGINT,
  visitors_this_week BIGINT,
  visitors_this_month BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized admin access required';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_page_views,
    COUNT(DISTINCT v.anonymous_visitor_id)::BIGINT AS unique_visitors,
    COUNT(DISTINCT v.session_id)::BIGINT AS total_sessions,
    COUNT(DISTINCT CASE WHEN v.created_at >= date_trunc('day', NOW()) THEN v.anonymous_visitor_id END)::BIGINT AS visitors_today,
    COUNT(DISTINCT CASE WHEN v.created_at >= NOW() - INTERVAL '7 days' THEN v.anonymous_visitor_id END)::BIGINT AS visitors_this_week,
    COUNT(DISTINCT CASE WHEN v.created_at >= NOW() - INTERVAL '30 days' THEN v.anonymous_visitor_id END)::BIGINT AS visitors_this_month
  FROM public.visitor_analytics v
  WHERE v.created_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$;

-- Enable Supabase Realtime on enquiries and site_content
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;

