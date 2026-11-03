"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { subDays } from "date-fns";
import { Mail, RefreshCw, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { NewsletterSubscriber } from "@/types/newsletter";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/format-date";
import {
  toggleSubscriberStatusAction,
  addAdminNewsletterSubscriberAction,
  deleteNewsletterSubscriberAction,
} from "@/actions/newsletter.actions";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ExportButton } from "@/components/admin/shared/export-button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

interface SubscriberTableProps {
  initialSubscribers: NewsletterSubscriber[];
}

export function SubscriberTable({ initialSubscribers }: SubscriberTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [subscribers, setSubscribers] =
    useState<NewsletterSubscriber[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUBSCRIBED" | "UNSUBSCRIBED">("ALL");
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialSubscribers.length === 0) {
      void getFromIndexedDB<NewsletterSubscriber[]>("admin_subscribers_records").then((cached) => {
        if (cached && cached.length > 0) {
          setSubscribers(cached);
        }
      });
    } else {
      setSubscribers(initialSubscribers);
      void saveToIndexedDB("admin_subscribers_records", initialSubscribers);
    }
  }, [initialSubscribers]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-newsletter-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "newsletter_subscribers",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const added = payload.new as NewsletterSubscriber;
            setSubscribers((prev) =>
              prev.some((s) => s.id === added.id) ? prev : [added, ...prev]
            );
            toast.info(`New subscriber joined: ${added.email}`);
            router.refresh();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as NewsletterSubscriber;
            setSubscribers((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
            router.refresh();
          } else if (payload.eventType === "DELETE") {
            const removed = payload.old as { id?: string };
            if (removed?.id) {
              setSubscribers((prev) => prev.filter((s) => s.id !== removed.id));
              router.refresh();
            }
          }
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

  // Live KPI metrics derived from `subscribers`
  const activeCount = useMemo(
    () => subscribers.filter((s) => s.is_subscribed).length,
    [subscribers]
  );
  const unsubscribedCount = subscribers.length - activeCount;
  const joinedThisMonth = useMemo(() => {
    const monthAgo = subDays(new Date(), 30).toISOString();
    return subscribers.filter(
      (s) => s.is_subscribed && s.created_at >= monthAgo
    ).length;
  }, [subscribers]);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (statusFilter === "SUBSCRIBED" && !s.is_subscribed) return false;
      if (statusFilter === "UNSUBSCRIBED" && s.is_subscribed) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.email.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    });
  }, [subscribers, searchQuery, statusFilter]);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsAdding(true);
    try {
      const res = await addAdminNewsletterSubscriberAction(newEmail);
      if (!res.success || !res.subscriber) {
        toast.error(res.error || "Unable to add subscriber.");
        return;
      }
      const added = res.subscriber;
      setSubscribers((prev) =>
        prev.some((s) => s.id === added.id)
          ? prev.map((s) => (s.id === added.id ? added : s))
          : [added, ...prev]
      );
      setNewEmail("");
      toast.success(`Added ${added.email} to public.newsletter_subscribers.`);
      router.refresh();
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteNewsletterSubscriberAction(deleteTarget.id);
      if (!res.success) {
        toast.error(res.error || "Unable to delete subscriber.");
        return;
      }
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success(`Deleted ${deleteTarget.email} from Supabase.`);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggle = async (sub: NewsletterSubscriber) => {
    const nextState = !sub.is_subscribed;
    const res = await toggleSubscriberStatusAction(sub.id, nextState);
    if (!res.success) {
      toast.error(res.error || "Unable to update subscription status.");
      return;
    }
    setSubscribers((prev) =>
      prev.map((item) =>
        item.id === sub.id ? { ...item, is_subscribed: nextState } : item
      )
    );
    toast.success(
      `${sub.email} marked as ${nextState ? "Subscribed" : "Unsubscribed"}.`
    );
    router.refresh();
  };

  const columns = useMemo<ColumnDef<NewsletterSubscriber>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Subscriber ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            #{row.original.id.slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Subscriber Email",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "is_subscribed",
        header: "Status",
        cell: ({ row }) =>
          row.original.is_subscribed ? (
            <Badge variant="success">Subscribed</Badge>
          ) : (
            <Badge variant="outline">Unsubscribed</Badge>
          ),
      },
      {
        accessorKey: "created_at",
        header: "Joined Date",
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
      {
        id: "actions",
        header: "Manage",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggle(row.original)}
              className="border border-border bg-surface px-3 py-1 text-xs text-foreground hover:border-accent"
            >
              {row.original.is_subscribed ? "Unsubscribe" : "Resubscribe"}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              aria-label={`Delete subscriber ${row.original.email}`}
              title={`Delete ${row.original.email}`}
              className="inline-flex h-7 w-7 items-center justify-center border border-border bg-surface text-red-600 hover:border-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const exportRows = filtered.map((s) => [
    s.id,
    s.email,
    s.is_subscribed ? "Subscribed" : "Unsubscribed",
    s.created_at,
  ]);

  return (
    <div className="space-y-6">
      {/* Realtime Stream Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Connected to <code className="font-mono">public.newsletter_subscribers</code> in Supabase • New House Journal sign-ups stream here in real time.
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
          label="Total Subscribers"
          value={subscribers.length}
          subtitle="All-time newsletter records"
        />
        <StatCard
          label="Active Subscribers"
          value={activeCount}
          subtitle="Currently opted-in"
        />
        <StatCard
          label="Joined (30 Days)"
          value={joinedThisMonth}
          subtitle="New subscribers this month"
        />
        <StatCard
          label="Unsubscribed"
          value={unsubscribedCount}
          subtitle="Opted-out addresses"
        />
      </div>

      {/* Add Subscriber Directly to Supabase */}
      <form
        onSubmit={handleAddSubscriber}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface-elevated p-4"
      >
        <div className="space-y-0.5">
          <label
            htmlFor="admin-add-subscriber-email"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Register Subscriber in Supabase
          </label>
          <p className="text-xs text-muted-foreground">
            Inserts directly into <code className="font-mono">public.newsletter_subscribers</code> alongside public website sign-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Input
            id="admin-add-subscriber-email"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="client@domain.com"
            className="w-full sm:w-64"
          />
          <Button type="submit" size="sm" disabled={isAdding} className="shrink-0">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isAdding ? "Adding..." : "Add Subscriber"}</span>
          </Button>
        </div>
      </form>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subscribers by email or ID..."
      >
        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "ALL" | "SUBSCRIBED" | "UNSUBSCRIBED")
          }
          aria-label="Filter subscribers by status"
          className="w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBSCRIBED">Subscribed Only</option>
          <option value="UNSUBSCRIBED">Unsubscribed Only</option>
        </Select>

        <ExportButton
          filename="scents-mists-subscribers"
          headers={["ID", "Email", "Status", "Subscribed At"]}
          rows={exportRows}
          label="Export Subscribers CSV"
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={filtered}
        ariaLabel="Newsletter subscribers table"
        emptyTitle="No Newsletter Subscribers Recorded in Supabase Yet"
        emptyDescription="Email addresses submitted through The House Journal form on the public website or added above will stream here automatically."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Subscriber"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.email}" from public.newsletter_subscribers?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

