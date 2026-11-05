"use client";

import React from "react";
import type { DashboardOverviewStats } from "@/types/analytics";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { PageViewChart } from "./page-view-chart";
import { TrafficSourceChart } from "./traffic-source-chart";
import { DeviceBreakdown } from "./device-breakdown";
import { PopularPagesTable } from "./popular-pages-table";
import { ExportButton } from "@/components/admin/shared/export-button";

interface VisitorAnalyticsProps {
  stats: DashboardOverviewStats;
}

export function VisitorAnalytics({ stats }: VisitorAnalyticsProps) {
  const csvRows = stats.mostViewedPages.map((p) => [
    p.page_path,
    p.views,
    p.unique_visitors,
  ]);

  const avgViewsPerSession =
    stats.totalSessions > 0
      ? (stats.totalPageViews / stats.totalSessions).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-foreground">
            Traffic &amp; Engagement Metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Live telemetry aggregated directly from <code className="font-mono">public.visitor_analytics</code> in Supabase
          </p>
        </div>
        <ExportButton
          filename="scents-mists-page-analytics"
          sheetName="Page Analytics"
          headers={["Page Path", "Total Page Views", "Unique Visitors"]}
          rows={csvRows}
          label="Export Analytics"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Page Views"
          value={stats.totalPageViews}
          subtitle={`${stats.mostViewedPages.length} distinct public routes visited`}
        />
        <StatCard
          label="Unique Visitors"
          value={stats.uniqueVisitors}
          subtitle={`Today: ${stats.visitorsToday} • This Week: ${stats.visitorsThisWeek}`}
        />
        <StatCard
          label="Active Sessions"
          value={stats.totalSessions}
          subtitle={`Avg. ${avgViewsPerSession} page views per session`}
        />
        <StatCard
          label="Visitors (30 Days)"
          value={stats.visitorsThisMonth}
          subtitle="Rolling 30-day unique anonymous visitors"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PageViewChart data={stats.visitorTrends} />
        </div>
        <div className="lg:col-span-5">
          <TrafficSourceChart data={stats.trafficSources} />
        </div>
      </div>

      <DeviceBreakdown
        devices={stats.deviceBreakdown}
        browsers={stats.browserBreakdown}
      />

      <PopularPagesTable pages={stats.mostViewedPages} />
    </div>
  );
}

