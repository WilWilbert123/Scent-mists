"use server";

import { subDays, startOfDay, format, parseISO } from "date-fns";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServiceClient, verifyServerAdmin } from "@/lib/supabase/admin";
import { computeVisitorAggregates } from "@/lib/analytics";
import type { DashboardOverviewStats, VisitorAnalyticsRecord } from "@/types/analytics";
import type { Enquiry } from "@/types/enquiry";

const EMPTY_OVERVIEW_STATS: DashboardOverviewStats = {
  totalVisitors: 0,
  uniqueVisitors: 0,
  totalPageViews: 0,
  totalSessions: 0,
  visitorsToday: 0,
  visitorsThisWeek: 0,
  visitorsThisMonth: 0,
  enquiriesReceived: 0,
  pendingEnquiries: 0,
  resolvedEnquiries: 0,
  newsletterSubscribers: 0,
  publishedProductsCount: 0,
  totalProductsCount: 0,
  publishedCollectionsCount: 0,
  auditLogsCount: 0,
  mostViewedPages: [],
  popularFragrances: [],
  visitorTrends: [],
  enquiryTrends: [],
  trafficSources: [],
  deviceBreakdown: [],
  browserBreakdown: [],
  isDatabaseConnected: false,
};

/**
 * Retrieves real database-backed analytics and overview metrics for the Admin Dashboard.
 * Never returns hardcoded or fake metrics. If no records exist or Supabase is not connected,
 * returns zeroed metrics with `isDatabaseConnected` status.
 */
export async function getDashboardOverviewStatsAction(
  daysBack = 30
): Promise<DashboardOverviewStats> {
  if (!isSupabaseConfigured()) {
    return EMPTY_OVERVIEW_STATS;
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return EMPTY_OVERVIEW_STATS;
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return EMPTY_OVERVIEW_STATS;
  }

  const now = new Date();
  const sinceDate = subDays(now, daysBack).toISOString();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = subDays(now, 7).toISOString();
  const monthStart = subDays(now, 30).toISOString();

  const [
    visitorsRes,
    enquiriesRes,
    newsletterRes,
    productsRes,
    collectionsRes,
    auditLogsRes,
  ] = await Promise.all([
    supabase
      .from("visitor_analytics")
      .select("*")
      .gte("created_at", sinceDate)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_subscribed", true),
    supabase
      .from("products")
      .select("name, slug, fragrance_family, is_published")
      .order("is_featured", { ascending: false }),
    supabase
      .from("collections")
      .select("id, is_published"),
    supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  const rawVisitorRows = ((visitorsRes.data ?? []) as VisitorAnalyticsRecord[]);
  // Normalize any legacy slug path in analytics rows
  const visitorRows = rawVisitorRows.map((row) => ({
    ...row,
    page_path:
      row.page_path === "/products/himalayan-cherry-blossom-air"
        ? "/products/sakura-and-mountain-mist"
        : row.page_path,
  }));

  const enquiryRows = ((enquiriesRes.data ?? []) as Enquiry[]);
  const productRows = ((productsRes.data ?? []) as {
    name: string;
    slug: string;
    fragrance_family?: string;
    is_published?: boolean;
  }[]);
  const collectionRows = ((collectionsRes.data ?? []) as {
    id: string;
    is_published?: boolean;
  }[]);

  const aggregates = computeVisitorAggregates(visitorRows);

  const visitorsTodaySet = new Set<string>();
  const visitorsWeekSet = new Set<string>();
  const visitorsMonthSet = new Set<string>();

  for (const v of visitorRows) {
    if (v.created_at >= todayStart) visitorsTodaySet.add(v.anonymous_visitor_id);
    if (v.created_at >= weekStart) visitorsWeekSet.add(v.anonymous_visitor_id);
    if (v.created_at >= monthStart) visitorsMonthSet.add(v.anonymous_visitor_id);
  }

  // Group visitor trends across a continuous calendar window so AreaChart renders a proper curve
  const chartWindowDays = Math.min(Math.max(daysBack, 7), 14);
  const trendByDate = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = chartWindowDays - 1; i >= 0; i--) {
    const dayKey = format(subDays(now, i), "MMM d");
    trendByDate.set(dayKey, { views: 0, visitors: new Set<string>() });
  }

  for (const v of visitorRows) {
    try {
      const dayKey = format(parseISO(v.created_at), "MMM d");
      const entry = trendByDate.get(dayKey) ?? { views: 0, visitors: new Set<string>() };
      entry.views += 1;
      entry.visitors.add(v.anonymous_visitor_id);
      trendByDate.set(dayKey, entry);
    } catch {
      // Skip invalid date
    }
  }

  const visitorTrends =
    visitorRows.length === 0
      ? []
      : Array.from(trendByDate.entries()).map(([date, item]) => ({
          date,
          pageViews: item.views,
          uniqueVisitors: item.visitors.size,
        }));

  // Group enquiry trends by calendar date
  const enquiryByDate = new Map<string, number>();
  if (enquiryRows.length > 0) {
    for (let i = chartWindowDays - 1; i >= 0; i--) {
      const dayKey = format(subDays(now, i), "MMM d");
      enquiryByDate.set(dayKey, 0);
    }
    for (const e of enquiryRows) {
      if (e.created_at >= sinceDate) {
        try {
          const dayKey = format(parseISO(e.created_at), "MMM d");
          enquiryByDate.set(dayKey, (enquiryByDate.get(dayKey) ?? 0) + 1);
        } catch {
          // Skip invalid date
        }
      }
    }
  }

  const enquiryTrends =
    enquiryRows.length === 0
      ? []
      : Array.from(enquiryByDate.entries()).map(([date, count]) => ({
          date,
          count,
        }));

  // Popular fragrances derived from real `public.products` rows joined with real `public.visitor_analytics` views
  const pageMetricsBySlug = new Map<string, { views: number; uniqueVisitors: number }>();
  for (const p of aggregates.mostViewedPages) {
    if (p.page_path.startsWith("/products/")) {
      const slug = p.page_path.replace("/products/", "");
      pageMetricsBySlug.set(slug, {
        views: p.views,
        uniqueVisitors: p.unique_visitors,
      });
    }
  }

  const popularFragrances = productRows
    .map((prod) => {
      const normalizedSlug =
        prod.slug === "himalayan-cherry-blossom-air"
          ? "sakura-and-mountain-mist"
          : prod.slug;
      const normalizedName =
        prod.name === "Himalayan Cherry Blossom Air"
          ? "Sakura & Mountain Mist"
          : prod.name;
      const metrics = pageMetricsBySlug.get(normalizedSlug) ?? {
        views: 0,
        uniqueVisitors: 0,
      };
      return {
        slug: normalizedSlug,
        name: normalizedName,
        family: prod.fragrance_family,
        views: metrics.views,
        uniqueVisitors: metrics.uniqueVisitors,
      };
    })
    .sort((a, b) => b.views - a.views);

  const pendingEnquiries = enquiryRows.filter(
    (e) => e.status === "NEW" || e.status === "PENDING"
  ).length;
  const resolvedEnquiries = enquiryRows.filter((e) => e.status === "RESOLVED").length;

  const publishedProductsCount = productRows.filter((p) => p.is_published !== false).length;
  const publishedCollectionsCount = collectionRows.filter(
    (c) => c.is_published !== false
  ).length;

  return {
    totalVisitors: aggregates.uniqueVisitors,
    uniqueVisitors: aggregates.uniqueVisitors,
    totalPageViews: aggregates.totalPageViews,
    totalSessions: aggregates.totalSessions,
    visitorsToday: visitorsTodaySet.size,
    visitorsThisWeek: visitorsWeekSet.size,
    visitorsThisMonth: visitorsMonthSet.size,
    enquiriesReceived: enquiryRows.length,
    pendingEnquiries,
    resolvedEnquiries,
    newsletterSubscribers: newsletterRes.count ?? 0,
    publishedProductsCount,
    totalProductsCount: productRows.length,
    publishedCollectionsCount,
    auditLogsCount: auditLogsRes.count ?? 0,
    mostViewedPages: aggregates.mostViewedPages.slice(0, 10),
    popularFragrances,
    visitorTrends,
    enquiryTrends,
    trafficSources: aggregates.trafficSources,
    deviceBreakdown: aggregates.deviceBreakdown,
    browserBreakdown: aggregates.browserBreakdown,
    isDatabaseConnected: true,
  };
}

export async function getVisitorLogsAction({
  limit = 100,
  deviceFilter,
  referrerFilter,
}: {
  limit?: number;
  deviceFilter?: string;
  referrerFilter?: string;
} = {}): Promise<{
  records: VisitorAnalyticsRecord[];
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { records: [], isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { records: [], isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { records: [], isDatabaseConnected: false };
  }

  let query = supabase
    .from("visitor_analytics")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (deviceFilter && deviceFilter !== "ALL") {
    query = query.eq("device_category", deviceFilter);
  }
  if (referrerFilter && referrerFilter !== "ALL") {
    query = query.eq("referrer_category", referrerFilter);
  }

  const { data } = await query;
  const normalizedRecords = ((data ?? []) as VisitorAnalyticsRecord[]).map(
    (row) => ({
      ...row,
      page_path:
        row.page_path === "/products/himalayan-cherry-blossom-air"
          ? "/products/sakura-and-mountain-mist"
          : row.page_path,
    })
  );

  return {
    records: normalizedRecords,
    isDatabaseConnected: true,
  };
}

