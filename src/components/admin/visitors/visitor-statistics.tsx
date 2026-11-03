import React from "react";
import { ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import type { VisitorAnalyticsRecord } from "@/types/analytics";

interface VisitorStatisticsProps {
  records: VisitorAnalyticsRecord[];
}

export function VisitorStatistics({ records }: VisitorStatisticsProps) {
  const uniqueVisitors = new Set(records.map((r) => r.anonymous_visitor_id)).size;
  const uniqueSessions = new Set(records.map((r) => r.session_id)).size;
  const uniquePages = new Set(records.map((r) => r.page_path)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border border-border bg-surface px-4 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
        <span>
          Privacy-Conscious Analytics: No IP addresses, geolocation, or personal
          identifiers are collected or displayed.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Logged Page Views"
          value={records.length}
          subtitle="Recent event log entries"
        />
        <StatCard
          label="Unique Anonymous Visitors"
          value={uniqueVisitors}
          subtitle="Distinct anonymous_visitor_id"
        />
        <StatCard
          label="Active Sessions"
          value={uniqueSessions}
          subtitle="Distinct session_id"
        />
        <StatCard
          label="Routes Visited"
          value={uniquePages}
          subtitle="Distinct public paths"
        />
      </div>
    </div>
  );
}

