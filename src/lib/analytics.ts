import type {
  BrowserCategory,
  DeviceCategory,
  ReferrerCategory,
  VisitorAnalyticsRecord,
} from "@/types/analytics";

/**
 * Privacy-conscious referrer categorization.
 * Avoids storing full URLs with query tokens or personal parameters.
 */
export function categorizeReferrer(referrer: string, currentHost?: string): ReferrerCategory {
  if (!referrer || referrer.trim() === "") return "Direct";
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (currentHost && host === currentHost.toLowerCase()) {
      return "Direct";
    }
    if (
      host.includes("google.") ||
      host.includes("bing.") ||
      host.includes("duckduckgo.") ||
      host.includes("yahoo.") ||
      host.includes("ecosia.")
    ) {
      return "Organic Search";
    }
    if (
      host.includes("instagram.") ||
      host.includes("pinterest.") ||
      host.includes("facebook.") ||
      host.includes("tiktok.") ||
      host.includes("linkedin.") ||
      host.includes("x.com") ||
      host.includes("twitter.") ||
      host.includes("youtube.")
    ) {
      return "Social";
    }
    return "Referral";
  } catch {
    return "Direct";
  }
}

export function categorizeDevice(userAgent: string, viewportWidth?: number): DeviceCategory {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(ua) || (viewportWidth && viewportWidth >= 768 && viewportWidth < 1024 && /mobile|touch/i.test(ua))) {
    return "Tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua) || (viewportWidth && viewportWidth < 768)) {
    return "Mobile";
  }
  return "Desktop";
}

export function categorizeBrowser(userAgent: string): BrowserCategory {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  return "Other";
}

/**
 * Computes distinct page views vs unique anonymous visitors from raw database records.
 */
export function computeVisitorAggregates(records: VisitorAnalyticsRecord[]) {
  const totalPageViews = records.length;
  const uniqueVisitorSet = new Set<string>();
  const sessionSet = new Set<string>();
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  const sourceMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();

  for (const r of records) {
    uniqueVisitorSet.add(r.anonymous_visitor_id);
    sessionSet.add(r.session_id);

    const existingPage = pageMap.get(r.page_path) ?? {
      views: 0,
      visitors: new Set<string>(),
    };
    existingPage.views += 1;
    existingPage.visitors.add(r.anonymous_visitor_id);
    pageMap.set(r.page_path, existingPage);

    sourceMap.set(r.referrer_category, (sourceMap.get(r.referrer_category) ?? 0) + 1);
    deviceMap.set(r.device_category, (deviceMap.get(r.device_category) ?? 0) + 1);
    browserMap.set(r.browser_category, (browserMap.get(r.browser_category) ?? 0) + 1);
  }

  const mostViewedPages = Array.from(pageMap.entries())
    .map(([page_path, data]) => ({
      page_path,
      views: data.views,
      unique_visitors: data.visitors.size,
    }))
    .sort((a, b) => b.views - a.views);

  const toBreakdown = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([key, count]) => ({
        key,
        count,
        percentage: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

  return {
    totalPageViews,
    uniqueVisitors: uniqueVisitorSet.size,
    totalSessions: sessionSet.size,
    mostViewedPages,
    trafficSources: toBreakdown(sourceMap).map((i) => ({
      source: i.key,
      count: i.count,
      percentage: i.percentage,
    })),
    deviceBreakdown: toBreakdown(deviceMap).map((i) => ({
      device: i.key,
      count: i.count,
      percentage: i.percentage,
    })),
    browserBreakdown: toBreakdown(browserMap).map((i) => ({
      browser: i.key,
      count: i.count,
      percentage: i.percentage,
    })),
  };
}

