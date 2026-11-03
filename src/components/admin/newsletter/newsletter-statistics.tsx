import React from "react";
import type { NewsletterStats } from "@/types/newsletter";
import { StatCard } from "@/components/admin/dashboard/stat-card";

interface NewsletterStatisticsProps {
  stats: NewsletterStats;
}

export function NewsletterStatistics({ stats }: NewsletterStatisticsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Subscribers"
        value={stats.totalSubscribers}
        subtitle="All recorded email entries"
      />
      <StatCard
        label="Active Subscribers"
        value={stats.activeSubscribers}
        subtitle="Currently opted in"
      />
      <StatCard
        label="Joined (Last 30 Days)"
        value={stats.subscribedThisMonth}
        subtitle="Recent journal signups"
      />
      <StatCard
        label="Unsubscribed"
        value={stats.unsubscribedCount}
        subtitle="Opted out of dispatches"
      />
    </div>
  );
}

