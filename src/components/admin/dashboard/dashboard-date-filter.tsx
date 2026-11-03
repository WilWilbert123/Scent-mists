"use client";

import React, { useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RefreshCw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

export function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentDays = searchParams.get("days") || "30";
  const [isPending, startTransition] = useTransition();

  // Subscribe to live Supabase changes so Dashboard & Analytics auto-update in real time
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-dashboard-live-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitor_analytics" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "newsletter_subscribers" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleSelectRange = (days: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days);
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Segmented Date Range Selector */}
      <div
        role="group"
        aria-label="Analytics date range"
        className="inline-flex items-center border border-border bg-surface-elevated p-0.5"
      >
        <span className="inline-flex items-center pl-2.5 pr-1.5 text-accent">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        {RANGES.map((range) => {
          const isActive = currentDays === range.value;
          return (
            <button
              key={range.value}
              type="button"
              onClick={() => handleSelectRange(range.value)}
              disabled={isPending}
              aria-pressed={isActive}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          );
        })}
      </div>

      {/* Manual Refresh Button */}
      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isPending}
        aria-label="Refresh live Supabase metrics"
        className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5", isPending && "animate-spin text-accent")}
          aria-hidden="true"
        />
        <span>Refresh</span>
      </button>
    </div>
  );
}

