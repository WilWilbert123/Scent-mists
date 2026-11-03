export type ReferrerCategory = "Direct" | "Organic Search" | "Social" | "Referral";
export type DeviceCategory = "Desktop" | "Mobile" | "Tablet";
export type BrowserCategory = "Chrome" | "Safari" | "Firefox" | "Edge" | "Other";

export interface VisitorAnalyticsRecord {
  id: string;
  anonymous_visitor_id: string;
  session_id: string;
  page_path: string;
  referrer_category: string;
  device_category: string;
  browser_category: string;
  created_at: string;
}

export interface DashboardOverviewStats {
  totalVisitors: number;
  uniqueVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  visitorsToday: number;
  visitorsThisWeek: number;
  visitorsThisMonth: number;
  enquiriesReceived: number;
  pendingEnquiries: number;
  resolvedEnquiries: number;
  newsletterSubscribers: number;
  publishedProductsCount: number;
  totalProductsCount: number;
  publishedCollectionsCount: number;
  auditLogsCount: number;
  mostViewedPages: { page_path: string; views: number; unique_visitors: number }[];
  popularFragrances: {
    slug: string;
    name: string;
    family?: string;
    views: number;
    uniqueVisitors?: number;
  }[];
  visitorTrends: { date: string; pageViews: number; uniqueVisitors: number }[];
  enquiryTrends: { date: string; count: number }[];
  trafficSources: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number; percentage: number }[];
  isDatabaseConnected: boolean;
}

