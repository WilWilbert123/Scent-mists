"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type {
  CleanableTableName,
  SupabaseDatabaseDiagnostics,
  SupabaseTableStat,
} from "@/actions/settings.actions";
import { cleanSupabaseTableAction } from "@/actions/settings.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";

interface DatabaseStorageManagerProps {
  initialDiagnostics: SupabaseDatabaseDiagnostics;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function DatabaseStorageManager({
  initialDiagnostics,
}: DatabaseStorageManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [diagnostics, setDiagnostics] =
    useState<SupabaseDatabaseDiagnostics>(initialDiagnostics);
  const [cleanTarget, setCleanTarget] = useState<SupabaseTableStat | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    setDiagnostics(initialDiagnostics);
  }, [initialDiagnostics]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-settings-db-diagnostics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleConfirmClean = async () => {
    if (!cleanTarget) return;
    setIsCleaning(true);
    try {
      const res = await cleanSupabaseTableAction(
        cleanTarget.tableName as CleanableTableName
      );
      if (!res.success) {
        toast.error(res.error || `Unable to clean public.${cleanTarget.tableName}.`);
        return;
      }

      toast.success(
        `Cleaned public.${cleanTarget.tableName} (${res.deletedCount ?? 0} rows removed).`
      );
      router.refresh();
    } finally {
      setIsCleaning(false);
      setCleanTarget(null);
    }
  };

  const freePercentage = Math.max(
    0,
    100 - diagnostics.usedPercentage
  ).toFixed(3);

  const storageAvailableBytes = Math.max(
    0,
    diagnostics.storageQuotaBytes - diagnostics.storageUsedBytes
  );

  return (
    <section className="space-y-6 border-t border-border pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <HardDrive className="h-4 w-4" aria-hidden="true" />
            <span className="eyebrow-label">
              Database Capacity &amp; Table Maintenance
            </span>
          </div>
          <h2 className="font-serif text-2xl text-foreground">
            Supabase Tables &amp; Available Space
          </h2>
          <p className="text-xs text-muted-foreground">
            Live inspection of all <code className="font-mono">public.*</code>{" "}
            PostgreSQL tables, storage footprint, available capacity, and one-click table cleaning.
          </p>
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
            <span>Refresh Space</span>
          </button>
        </div>
      </div>

      {/* Live Capacity KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available DB Space"
          value={formatBytes(diagnostics.availableBytes)}
          subtitle={`${freePercentage}% free of ${formatBytes(diagnostics.databaseQuotaBytes)}`}
        />
        <StatCard
          label="Database Space Used"
          value={formatBytes(diagnostics.totalUsedBytes)}
          subtitle={`Across ${diagnostics.tables.length} PostgreSQL tables`}
        />
        <StatCard
          label="Total Live Rows"
          value={diagnostics.totalRows}
          subtitle="All records in public schema"
        />
        <StatCard
          label="Available Media Storage"
          value={formatBytes(storageAvailableBytes)}
          subtitle={`${diagnostics.storageObjectsCount} files (${formatBytes(diagnostics.storageUsedBytes)} used)`}
        />
      </div>

      {/* Visual PostgreSQL Capacity Bar */}
      <div className="border border-border bg-surface-elevated p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="font-medium text-foreground">
              PostgreSQL Database Allocation ({formatBytes(diagnostics.totalUsedBytes)} used of{" "}
              {formatBytes(diagnostics.databaseQuotaBytes)})
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {formatBytes(diagnostics.availableBytes)} Available ({freePercentage}% Free)
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="PostgreSQL database storage usage"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.max(1, Math.round(diagnostics.usedPercentage))}
          className="h-2.5 w-full overflow-hidden border border-border bg-surface"
        >
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{
              width: `${Math.max(0.6, Math.min(100, diagnostics.usedPercentage))}%`,
            }}
          />
        </div>
      </div>

      {/* Live Supabase Tables List */}
      <Table ariaLabel="Supabase database tables and storage footprint">
        <TableHeader>
          <TableRow>
            <TableHead>PostgreSQL Table</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Live Rows</TableHead>
            <TableHead>Used Space</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>Table Maintenance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagnostics.tables.map((t) => (
            <TableRow key={t.tableName}>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-mono text-xs font-medium text-foreground">
                    public.{t.tableName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.displayName}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{t.category}</Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs font-medium text-foreground">
                  {t.rowCount.toLocaleString()} {t.rowCount === 1 ? "row" : "rows"}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatBytes(t.estimatedBytes)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {t.lastTimestamp
                    ? formatDisplayDateTime(t.lastTimestamp)
                    : "Empty (0 rows)"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link
                    href={t.manageHref}
                    className="inline-flex h-8 items-center gap-1.5 border border-border bg-surface px-2.5 text-xs text-foreground transition-colors hover:border-accent"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>

                  {t.canClean ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={t.rowCount === 0}
                      onClick={() => setCleanTarget(t)}
                      className={cn(
                        "h-8 px-3 text-xs",
                        t.rowCount > 0 &&
                          "border-red-600/40 text-red-600 hover:border-red-600 hover:bg-red-600/10"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {t.rowCount > 0
                          ? `Clean Table (${t.rowCount})`
                          : "Table Clean"}
                      </span>
                    </Button>
                  ) : (
                    <span className="inline-flex h-8 items-center gap-1.5 border border-border/70 bg-surface px-2.5 text-[11px] text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      <span>Protected Core</span>
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={Boolean(cleanTarget)}
        onOpenChange={(open) => {
          if (!open) setCleanTarget(null);
        }}
        title={
          cleanTarget
            ? `Clean Table: public.${cleanTarget.tableName}`
            : "Clean Table"
        }
        description={
          cleanTarget
            ? `Are you sure you want to permanently purge all ${cleanTarget.rowCount} rows from public.${cleanTarget.tableName} (${cleanTarget.displayName}) in Supabase? This frees table space immediately and cannot be undone.`
            : ""
        }
        confirmLabel="Purge Table Rows"
        isLoading={isCleaning}
        onConfirm={handleConfirmClean}
      />
    </section>
  );
}

