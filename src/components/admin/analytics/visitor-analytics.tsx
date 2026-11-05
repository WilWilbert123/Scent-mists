"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, AlertTriangle, X } from "lucide-react";
import type { DashboardOverviewStats } from "@/types/analytics";
import {
  getDashboardOverviewStatsAction,
  resetVisitorAnalyticsAction,
} from "@/actions/analytics.actions";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { PageViewChart } from "./page-view-chart";
import { TrafficSourceChart } from "./traffic-source-chart";
import { DeviceBreakdown } from "./device-breakdown";
import { PopularPagesTable } from "./popular-pages-table";
import { ExportButton } from "@/components/admin/shared/export-button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface VisitorAnalyticsProps {
  initialStats?: DashboardOverviewStats;
  stats?: DashboardOverviewStats;
  days?: number;
}

export function VisitorAnalytics({
  initialStats,
  stats: propStats,
  days = 30,
}: VisitorAnalyticsProps) {
  const [stats, setStats] = useState<DashboardOverviewStats>(
    initialStats || propStats!
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const refreshAnalytics = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const fresh = await getDashboardOverviewStatsAction(days);
        setStats(fresh);
        setLastSynced(new Date());
        if (!silent) {
          toast.success("Visitor telemetry synchronized.");
        }
      } catch {
        if (!silent) toast.error("Failed to refresh analytics.");
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [days]
  );

  // Snappy real-time polling every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshAnalytics(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshAnalytics]);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetVisitorAnalyticsAction();
      if (res.success) {
        toast.success("Test visitor analytics purged successfully. Telemetry reset to clean slate.");
        setIsResetModalOpen(false);
        refreshAnalytics(true);
      } else {
        toast.error(res.error || "Failed to reset visitor analytics.");
      }
    } catch {
      toast.error("Error resetting visitor telemetry.");
    } finally {
      setIsResetting(false);
    }
  };

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
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-xl text-foreground">
              Traffic &amp; Engagement Metrics
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>Live Realtime Feed</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live telemetry aggregated directly from <code className="font-mono">public.visitor_analytics</code> in Supabase
            <span className="ml-2 font-mono text-[10px] text-muted-foreground/70 hidden md:inline">
              (Synced: {lastSynced.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportButton
            filename="scents-mists-page-analytics"
            sheetName="Page Analytics"
            headers={["Page Path", "Total Page Views", "Unique Visitors"]}
            rows={csvRows}
            label="Export Analytics"
          />

          <button
            type="button"
            onClick={() => refreshAnalytics(false)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-border hover:border-accent text-foreground hover:text-accent rounded-lg transition-colors font-medium disabled:opacity-50 cursor-pointer h-9"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-accent")} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-surface border border-rose-500/30 hover:border-rose-500 text-rose-500 hover:bg-rose-500/5 rounded-lg transition-colors font-medium cursor-pointer h-9"
            title="Reset development and test traffic records"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Test Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
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

      {/* RESET TEST DATA CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-foreground">
                    Reset Visitor Telemetry?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Prune development &amp; testing traffic
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This will permanently delete all {stats.totalPageViews} recorded page view events from the{" "}
              <code className="font-mono text-accent">public.visitor_analytics</code> table in Supabase.
              <br /><br />
              Use this before launching to start fresh with clean, 100% genuine customer visits.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="px-4 py-2 text-xs bg-surface border border-border hover:border-foreground/30 text-foreground rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResetting ? "Purging Records..." : "Yes, Reset Analytics"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
