import React, { Suspense } from "react";
import { getDashboardOverviewStatsAction } from "@/actions/analytics.actions";
import { VisitorAnalytics } from "@/components/admin/analytics/visitor-analytics";
import { DashboardDateFilter } from "@/components/admin/dashboard/dashboard-date-filter";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const resolved = await searchParams;
  const days = Number(resolved.days) || 30;
  const stats = await getDashboardOverviewStatsAction(days);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-foreground">
            Visitor Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Detailed page views, unique anonymous visitors, device breakdown,
            and traffic sources.
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardDateFilter />
        </Suspense>
      </div>

      <VisitorAnalytics initialStats={stats} days={days} />
    </div>
  );
}

