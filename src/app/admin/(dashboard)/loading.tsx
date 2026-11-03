import React from "react";

export default function AdminDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading administrator view"
      className="space-y-8 animate-in fade-in duration-150"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2.5">
          <div className="h-8 w-56 bg-surface-elevated border border-border/60 animate-pulse" />
          <div className="h-3.5 w-80 bg-surface border border-border/40 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-surface-elevated border border-border/60 animate-pulse" />
      </div>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-border bg-surface-elevated p-5 space-y-3"
          >
            <div className="h-3 w-24 bg-surface animate-pulse" />
            <div className="h-7 w-16 bg-surface animate-pulse" />
            <div className="h-2.5 w-32 bg-surface animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Table / Chart Skeleton */}
      <div className="border border-border bg-surface-elevated p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="h-5 w-44 bg-surface animate-pulse" />
          <div className="h-8 w-28 bg-surface animate-pulse" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-11 w-full bg-surface/70 border border-border/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

