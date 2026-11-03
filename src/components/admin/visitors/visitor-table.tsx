"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, ExternalLink } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { VisitorAnalyticsRecord } from "@/types/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ExportButton } from "@/components/admin/shared/export-button";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";
import { VisitorFilters } from "./visitor-filters";

interface VisitorTableProps {
  records: VisitorAnalyticsRecord[];
}

function getRouteLabel(path: string): string {
  if (path === "/") return "Homepage Showcase";
  if (path === "/collections") return "Collections Index";
  if (path === "/shop") return "Complete Fragrance Showcase";
  if (path === "/about") return "Our House Story";
  if (path === "/fragrance-guide") return "Olfactory Fragrance Guide";
  if (path === "/contact") return "Client Concierge & Enquiries";
  if (path.startsWith("/products/")) {
    const slug = path.replace("/products/", "");
    if (
      slug === "sakura-and-mountain-mist" ||
      slug === "himalayan-cherry-blossom-air"
    ) {
      return "Product • Sakura & Mountain Mist";
    }
    const title = slug
      .split("-")
      .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
    return `Product • ${title}`;
  }
  return path;
}

export function VisitorTable({ records }: VisitorTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [liveRecords, setLiveRecords] = useState<VisitorAnalyticsRecord[]>(records);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  const [referrerFilter, setReferrerFilter] = useState("ALL");

  useEffect(() => {
    // If server passed empty records (e.g. while streaming), hydrate from local ChromeDB cache first
    if (records.length === 0) {
      void getFromIndexedDB<VisitorAnalyticsRecord[]>("admin_visitors_records").then(
        (cached) => {
          if (cached && cached.length > 0) {
            setLiveRecords(cached);
          }
        }
      );
    } else {
      setLiveRecords(records);
      void saveToIndexedDB("admin_visitors_records", records);
    }
  }, [records]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-visitor-log-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitor_analytics" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const rawNew = payload.new as VisitorAnalyticsRecord;
            const newRecord: VisitorAnalyticsRecord = {
              ...rawNew,
              page_path:
                rawNew.page_path === "/products/himalayan-cherry-blossom-air"
                  ? "/products/sakura-and-mountain-mist"
                  : rawNew.page_path,
            };
            setLiveRecords((prev) =>
              prev.some((item) => item.id === newRecord.id)
                ? prev
                : [newRecord, ...prev]
            );
          }
          router.refresh();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // Live KPI metrics derived from current Supabase records
  const uniqueVisitors = useMemo(
    () => new Set(liveRecords.map((r) => r.anonymous_visitor_id)).size,
    [liveRecords]
  );
  const uniqueSessions = useMemo(
    () => new Set(liveRecords.map((r) => r.session_id)).size,
    [liveRecords]
  );
  const uniquePages = useMemo(
    () => new Set(liveRecords.map((r) => r.page_path)).size,
    [liveRecords]
  );

  const filteredRecords = useMemo(() => {
    return liveRecords.filter((item) => {
      if (deviceFilter !== "ALL" && item.device_category !== deviceFilter) {
        return false;
      }
      if (referrerFilter !== "ALL" && item.referrer_category !== referrerFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          item.page_path.toLowerCase().includes(q) ||
          item.anonymous_visitor_id.toLowerCase().includes(q) ||
          item.session_id.toLowerCase().includes(q) ||
          item.browser_category.toLowerCase().includes(q) ||
          item.device_category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveRecords, deviceFilter, referrerFilter, searchQuery]);

  const columns = useMemo<ColumnDef<VisitorAnalyticsRecord>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Event ID",
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-muted-foreground">
            #{row.original.id.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "page_path",
        header: "Page Viewed",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="block text-xs font-medium text-foreground">
              {getRouteLabel(row.original.page_path)}
            </span>
            <Link
              href={row.original.page_path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline"
            >
              <span>{row.original.page_path}</span>
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "anonymous_visitor_id",
        header: "Anonymous Visitor ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {row.original.anonymous_visitor_id}
          </span>
        ),
      },
      {
        accessorKey: "session_id",
        header: "Session ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.session_id}
          </span>
        ),
      },
      {
        accessorKey: "referrer_category",
        header: "Traffic Source",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.referrer_category}</Badge>
        ),
      },
      {
        accessorKey: "device_category",
        header: "Device & Browser",
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.original.device_category} •{" "}
            <span className="text-muted-foreground">
              {row.original.browser_category}
            </span>
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Recorded Timestamp",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="block text-xs text-foreground">
              {formatDisplayDateTime(row.original.created_at)}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {formatRelativeTime(row.original.created_at)}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const exportRows = filteredRecords.map((r) => [
    r.id,
    r.anonymous_visitor_id,
    r.session_id,
    r.page_path,
    r.referrer_category,
    r.device_category,
    r.browser_category,
    r.created_at,
  ]);

  return (
    <div className="space-y-6">
      {/* Privacy & Realtime Connection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Live <code className="font-mono">public.visitor_analytics</code> stream • Privacy-conscious telemetry (no IP addresses or personal identifiers stored).
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent"
          >
            <RefreshCw
              className={cn("h-3 w-3", isPending && "animate-spin text-accent")}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Logged Page Views"
          value={liveRecords.length}
          subtitle={`Showing ${filteredRecords.length} matching rows`}
        />
        <StatCard
          label="Unique Anonymous Visitors"
          value={uniqueVisitors}
          subtitle="Distinct anonymous_visitor_id in Supabase"
        />
        <StatCard
          label="Active Sessions"
          value={uniqueSessions}
          subtitle="Distinct session_id in Supabase"
        />
        <StatCard
          label="Routes Visited"
          value={uniquePages}
          subtitle="Distinct public showcase paths"
        />
      </div>

      {/* Filter & Export Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by route, visitor ID, session ID, or browser..."
      >
        <VisitorFilters
          deviceFilter={deviceFilter}
          onDeviceChange={setDeviceFilter}
          referrerFilter={referrerFilter}
          onReferrerChange={setReferrerFilter}
        />
        <ExportButton
          filename="scents-mists-visitors"
          headers={[
            "Event ID",
            "Anonymous Visitor ID",
            "Session ID",
            "Page Path",
            "Referrer",
            "Device",
            "Browser",
            "Timestamp",
          ]}
          rows={exportRows}
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={filteredRecords}
        ariaLabel="Anonymous visitor session log"
        emptyTitle="No Visitor Sessions Match Filter"
        emptyDescription="Adjust your search query or device/source filters, or browse the public website to record new sessions."
      />
    </div>
  );
}

