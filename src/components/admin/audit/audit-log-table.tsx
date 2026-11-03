"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLogEntry } from "@/types/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ExportButton } from "@/components/admin/shared/export-button";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

interface AuditLogTableProps {
  initialLogs: AuditLogEntry[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("ALL");

  useEffect(() => {
    if (initialLogs.length === 0) {
      void getFromIndexedDB<AuditLogEntry[]>("admin_audit_logs_records").then((cached) => {
        if (cached && cached.length > 0) {
          setLogs(cached);
        }
      });
    } else {
      setLogs(initialLogs);
      void saveToIndexedDB("admin_audit_logs_records", initialLogs);
    }
  }, [initialLogs]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-audit-logs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "audit_logs" },
        (payload) => {
          const added = payload.new as AuditLogEntry;
          setLogs((prev) =>
            prev.some((item) => item.id === added.id) ? prev : [added, ...prev]
          );
          router.refresh();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const authEventsCount = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.resource_type === "auth" ||
          l.resource_type === "admin_profiles" ||
          l.action.startsWith("ADMIN_")
      ).length,
    [logs]
  );

  const catalogAndCmsCount = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.resource_type === "products" ||
          l.resource_type === "collections" ||
          l.resource_type === "site_content"
      ).length,
    [logs]
  );

  const clientWorkflowCount = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.resource_type === "enquiries" ||
          l.resource_type === "newsletter_subscribers"
      ).length,
    [logs]
  );

  const distinctResourceTypes = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      if (l.resource_type) set.add(l.resource_type);
    }
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (resourceFilter !== "ALL" && log.resource_type !== resourceFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.resource_type.toLowerCase().includes(q) ||
        (log.resource_id || "").toLowerCase().includes(q) ||
        (log.admin_email || "").toLowerCase().includes(q) ||
        log.admin_user_id.toLowerCase().includes(q) ||
        JSON.stringify(log.metadata || {})
          .toLowerCase()
          .includes(q)
      );
    });
  }, [logs, searchQuery, resourceFilter]);

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const action = row.original.action;
          const variant = action.includes("DELETED")
            ? "warning"
            : action.includes("CREATED") || action.includes("ADDED")
              ? "success"
              : action.includes("LOGIN")
                ? "blossom"
                : "default";
          return <Badge variant={variant}>{action}</Badge>;
        },
      },
      {
        id: "actor",
        header: "Admin Actor",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            {row.original.admin_email && (
              <span className="block text-xs font-medium text-foreground">
                {row.original.admin_email}
              </span>
            )}
            <span className="block font-mono text-[11px] text-muted-foreground">
              {row.original.admin_user_id.slice(0, 12)}...
            </span>
          </div>
        ),
      },
      {
        accessorKey: "resource_type",
        header: "Resource Type",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">
            {row.original.resource_type}
          </span>
        ),
      },
      {
        accessorKey: "resource_id",
        header: "Resource ID",
        cell: ({ row }) => (
          <span
            className="font-mono text-xs text-muted-foreground"
            title={row.original.resource_id || undefined}
          >
            {row.original.resource_id || "—"}
          </span>
        ),
      },
      {
        id: "metadata",
        header: "Metadata",
        cell: ({ row }) => {
          const metaStr = JSON.stringify(row.original.metadata || {});
          return (
            <span
              className="block max-w-xs truncate font-mono text-xs text-muted-foreground"
              title={metaStr}
            >
              {metaStr}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Timestamp",
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

  const exportRows = filtered.map((l) => [
    l.id,
    l.action,
    l.admin_email || l.admin_user_id,
    l.resource_type,
    l.resource_id || "",
    JSON.stringify(l.metadata || {}),
    l.created_at,
  ]);

  return (
    <div className="space-y-6">
      {/* Live Supabase Connection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Live <code className="font-mono">public.audit_logs</code> table in Supabase • Immutable compliance trail of all administrative operations.
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

      {/* Live Audit KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Audit Events"
          value={logs.length}
          subtitle="Recorded in public.audit_logs"
        />
        <StatCard
          label="Auth & Profile Events"
          value={authEventsCount}
          subtitle="Logins & security updates"
        />
        <StatCard
          label="Catalog & CMS Edits"
          value={catalogAndCmsCount}
          subtitle="Products, collections & site_content"
        />
        <StatCard
          label="Client & Subscriber Ops"
          value={clientWorkflowCount}
          subtitle="Enquiry & newsletter actions"
        />
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by action, admin email, resource ID, or metadata..."
      >
        <Select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          aria-label="Filter audit logs by resource type"
          className="w-48"
        >
          <option value="ALL">All Resource Types</option>
          {distinctResourceTypes.map((rt) => (
            <option key={rt} value={rt}>
              Resource: {rt}
            </option>
          ))}
        </Select>

        <ExportButton
          filename="scents-mists-audit-logs"
          headers={[
            "Log ID",
            "Action",
            "Admin Actor",
            "Resource Type",
            "Resource ID",
            "Metadata",
            "Timestamp",
          ]}
          rows={exportRows}
          label="Export Audit CSV"
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        ariaLabel="Administrative audit logs"
        emptyTitle="No Audit Log Entries Found"
        emptyDescription="Administrative actions (login, product updates, collection edits, content updates, and enquiry workflow changes) are recorded here automatically."
      />
    </div>
  );
}

