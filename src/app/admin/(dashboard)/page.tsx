import React, { Suspense } from "react";
import {
  Users,
  Eye,
  MessageSquare,
  Mail,
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { getDashboardOverviewStatsAction } from "@/actions/analytics.actions";
import { getAdminEnquiriesAction } from "@/actions/enquiry.actions";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { VisitorChart } from "@/components/admin/dashboard/visitor-chart";
import { TrafficSourceChart } from "@/components/admin/dashboard/traffic-source-chart";
import { EnquiryChart } from "@/components/admin/dashboard/enquiry-chart";
import { RecentEnquiries } from "@/components/admin/dashboard/recent-enquiries";
import { PopularProducts } from "@/components/admin/dashboard/popular-products";
import { DashboardDateFilter } from "@/components/admin/dashboard/dashboard-date-filter";
import { PopularPagesTable } from "@/components/admin/analytics/popular-pages-table";

interface AdminOverviewPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminOverviewPage({
  searchParams,
}: AdminOverviewPageProps) {
  const resolvedParams = await searchParams;
  const days = Number(resolvedParams.days) || 30;

  const [stats, enquiriesRes] = await Promise.all([
    getDashboardOverviewStatsAction(days),
    getAdminEnquiriesAction(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Live Supabase database metrics across visitor telemetry, catalog, enquiries, and journal subscriptions.
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardDateFilter />
        </Suspense>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unique Visitors"
          value={stats.uniqueVisitors}
          subtitle={`Today: ${stats.visitorsToday} • This Week: ${stats.visitorsThisWeek}`}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Total Page Views"
          value={stats.totalPageViews}
          subtitle={`${days}-Day Window • 30-Day Visitors: ${stats.visitorsThisMonth}`}
          icon={<Eye className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Enquiries Received"
          value={stats.enquiriesReceived}
          subtitle={`Pending: ${stats.pendingEnquiries} • Resolved: ${stats.resolvedEnquiries}`}
          icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Newsletter Subscribers"
          value={stats.newsletterSubscribers}
          subtitle="Active opted-in subscribers in Supabase"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {/* Secondary Live Database Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Visitors Today"
          value={stats.visitorsToday}
          subtitle="Unique anonymous visitors since 00:00 UTC"
          icon={<Activity className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Published Fragrances"
          value={stats.publishedProductsCount}
          subtitle={`${stats.totalProductsCount} total fragrances • ${stats.publishedCollectionsCount} active collections`}
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Security Audit Events"
          value={stats.auditLogsCount}
          subtitle={`Immutable admin trail • ${stats.pendingEnquiries} pending enquiries`}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <VisitorChart data={stats.visitorTrends} />
        </div>
        <div className="lg:col-span-5">
          <TrafficSourceChart data={stats.trafficSources} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <EnquiryChart data={stats.enquiryTrends} />
        </div>
        <div className="lg:col-span-5">
          <PopularProducts fragrances={stats.popularFragrances} />
        </div>
      </div>

      {/* Recent Enquiries & Most Viewed Pages */}
      <RecentEnquiries enquiries={enquiriesRes.enquiries} />
      <PopularPagesTable pages={stats.mostViewedPages} />
    </div>
  );
}

