"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  CheckCircle,
  Clock,
  Trash2,
  MessageSquare,
  RefreshCw,
  FileText,
  ShoppingBag,
  ExternalLink,
  MessageSquareText,
} from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/types/enquiry";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/format-date";
import {
  deleteEnquiryAction,
  updateEnquiryStatusAction,
  purgeOrderAlertsAction,
} from "@/actions/enquiry.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { EnquiryStatusBadge } from "./enquiry-status-badge";
import { EnquiryFilters } from "./enquiry-filters";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ExportButton } from "@/components/admin/shared/export-button";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

interface EnquiryTableProps {
  initialEnquiries: Enquiry[];
}

export function EnquiryTable({ initialEnquiries }: EnquiryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [activeTab, setActiveTab] = useState<"client" | "orders" | "all">("client");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  useEffect(() => {
    if (initialEnquiries.length === 0) {
      void getFromIndexedDB<Enquiry[]>("admin_enquiries_records").then((cached) => {
        if (cached && cached.length > 0) {
          setEnquiries(cached);
        }
      });
    } else {
      setEnquiries(initialEnquiries);
      void saveToIndexedDB("admin_enquiries_records", initialEnquiries);
    }
  }, [initialEnquiries]);

  // Supabase Realtime subscription for live enquiry updates
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-enquiries-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const added = payload.new as Enquiry;
            setEnquiries((prev) =>
              prev.some((e) => e.id === added.id) ? prev : [added, ...prev]
            );
            toast.info(`New enquiry received from ${added.full_name}.`);
            router.refresh();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Enquiry;
            setEnquiries((prev) =>
              prev.map((e) => (e.id === updated.id ? updated : e))
            );
            router.refresh();
          } else if (payload.eventType === "DELETE") {
            const removed = payload.old as { id?: string };
            if (removed?.id) {
              setEnquiries((prev) => prev.filter((e) => e.id !== removed.id));
              router.refresh();
            }
          }
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

  // Split counts between true client enquiries vs mirrored orders
  const clientEnquiries = useMemo(
    () => enquiries.filter((e) => !e.subject.startsWith("[NEW ORDER]")),
    [enquiries]
  );
  const orderAlerts = useMemo(
    () => enquiries.filter((e) => e.subject.startsWith("[NEW ORDER]")),
    [enquiries]
  );

  // Tab-scoped data
  const tabScopedEnquiries = useMemo(() => {
    if (activeTab === "client") return clientEnquiries;
    if (activeTab === "orders") return orderAlerts;
    return enquiries;
  }, [activeTab, clientEnquiries, orderAlerts, enquiries]);

  // Live KPI breakdowns based on currently active tab
  const newCount = useMemo(
    () => tabScopedEnquiries.filter((e) => e.status === "NEW").length,
    [tabScopedEnquiries]
  );
  const pendingCount = useMemo(
    () => tabScopedEnquiries.filter((e) => e.status === "PENDING").length,
    [tabScopedEnquiries]
  );
  const resolvedCount = useMemo(
    () => tabScopedEnquiries.filter((e) => e.status === "RESOLVED").length,
    [tabScopedEnquiries]
  );

  const filteredEnquiries = useMemo(() => {
    return tabScopedEnquiries.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.full_name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          (item.phone && item.phone.toLowerCase().includes(q)) ||
          item.subject.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tabScopedEnquiries, statusFilter, searchQuery]);

  const handleQuickStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      const res = await updateEnquiryStatusAction({ id, status });
      if (!res.success) {
        toast.error(res.error || "Failed to update status.");
        return;
      }
      setEnquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success(`Enquiry marked as ${status}.`);
      router.refresh();
    },
    [router]
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteEnquiryAction(deleteTarget.id);
      if (!res.success) {
        toast.error(res.error || "Unable to delete enquiry.");
        return;
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Enquiry deleted.");
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handlePurgeOrderAlerts = async () => {
    setIsPurging(true);
    try {
      const res = await purgeOrderAlertsAction();
      if (res.success) {
        setEnquiries((prev) =>
          prev.filter((e) => !e.subject.startsWith("[NEW ORDER]"))
        );
        toast.success(`Cleaned up ${res.count} order notifications. Enquiries inbox is now 100% clean.`);
        setIsPurgeModalOpen(false);
        setActiveTab("client");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to purge order alerts.");
      }
    } catch {
      toast.error("Error purging order alerts.");
    } finally {
      setIsPurging(false);
    }
  };

  const columns = useMemo<ColumnDef<Enquiry>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Ref ID",
        cell: ({ row }) => (
          <Link
            href={`/admin/enquiries/${row.original.id}`}
            className="font-mono text-xs text-accent hover:underline"
          >
            #{row.original.id.slice(0, 8).toUpperCase()}
          </Link>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Client & Contact",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <Link
              href={`/admin/enquiries/${row.original.id}`}
              className="font-medium text-foreground hover:text-accent underline-offset-4 hover:underline"
            >
              {row.original.full_name}
            </Link>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
            {row.original.phone && (
              <p className="font-mono text-[11px] text-muted-foreground">
                {row.original.phone}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject & Message",
        cell: ({ row }) => {
          const isOrderAlert = row.original.subject.startsWith("[NEW ORDER]");

          return (
            <div className="max-w-md space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isOrderAlert ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                    <ShoppingBag className="h-3 w-3" />
                    <span>Order Receipt</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                    <MessageSquareText className="h-3 w-3" />
                    <span>Client Inquiry</span>
                  </span>
                )}
                <p className="font-medium text-foreground line-clamp-1">
                  {row.original.subject}
                </p>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                {row.original.message}
              </p>

              {row.original.internal_notes && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-accent">
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  <span>Internal Note Attached</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <EnquiryStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Submitted",
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
        header: "Actions",
        cell: ({ row }) => {
          const isOrderAlert = row.original.subject.startsWith("[NEW ORDER]");

          return (
            <div className="flex items-center gap-2">
              {isOrderAlert && (
                <Link
                  href="/admin/orders"
                  title="View in Orders Dashboard"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent text-accent-foreground rounded font-medium hover:opacity-90"
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span className="hidden sm:inline">Orders</span>
                </Link>
              )}
              <Link
                href={`/admin/enquiries/${row.original.id}`}
                aria-label={`View enquiry from ${row.original.full_name}`}
                className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent rounded"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => handleQuickStatus(row.original.id, "PENDING")}
                title="Mark as Pending"
                aria-label={`Mark enquiry from ${row.original.full_name} as Pending`}
                className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent rounded cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickStatus(row.original.id, "RESOLVED")}
                title="Mark as Resolved"
                aria-label={`Mark enquiry from ${row.original.full_name} as Resolved`}
                className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-emerald-600 hover:border-emerald-600 rounded cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(row.original)}
                title="Delete Enquiry"
                aria-label={`Delete enquiry from ${row.original.full_name}`}
                className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-red-600 hover:border-red-600 rounded cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        },
      },
    ],
    [handleQuickStatus]
  );

  const exportRows = filteredEnquiries.map((e) => [
    e.id,
    e.full_name,
    e.email,
    e.phone || "",
    e.subject,
    e.message,
    e.status,
    e.internal_notes || "",
    e.created_at,
  ]);

  return (
    <div className="space-y-6">
      {/* Realtime Stream Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground rounded-xl">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Connected to <code className="font-mono">public.enquiries</code> in Supabase • Submissions from <code className="font-mono">/contact</code> and homepage concierge stream live.
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent rounded-lg cursor-pointer"
          >
            <RefreshCw
              className={cn("h-3 w-3", isPending && "animate-spin text-accent")}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2 MAIN TABS: CLIENT INQUIRIES vs ORDER RECEIPTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("client")}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer border",
              activeTab === "client"
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            <span>Client Inquiries &amp; Concierge</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                activeTab === "client"
                  ? "bg-background/20 text-background font-bold"
                  : "bg-surface-elevated text-muted-foreground border border-border/60"
              )}
            >
              {clientEnquiries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer border",
              activeTab === "orders"
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Order Notifications</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                activeTab === "orders"
                  ? "bg-background/20 text-background font-bold"
                  : "bg-surface-elevated text-muted-foreground border border-border/60"
              )}
            >
              {orderAlerts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer border",
              activeTab === "all"
                ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span>All ({enquiries.length})</span>
          </button>
        </div>

        {orderAlerts.length > 0 && activeTab === "orders" && (
          <button
            type="button"
            onClick={() => setIsPurgeModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 underline font-medium self-end sm:self-auto cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clean Up Order Alerts from Enquiries</span>
          </button>
        )}
      </div>

      {/* Info Callout for Order Notifications tab */}
      {activeTab === "orders" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-accent/10 border border-accent/25 text-xs animate-in fade-in">
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-accent" />
              <span>Orders Are Fully Handled in the Dedicated Orders Dashboard</span>
            </p>
            <p className="text-muted-foreground">
              These entries are automated checkout notifications. You have a full dedicated Customer Orders system with Leaflet GPS drop pins and delivery workflows.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent text-accent-foreground font-medium rounded-lg text-xs whitespace-nowrap hover:opacity-90 shrink-0 self-start sm:self-auto"
          >
            <span>Open Orders Dashboard</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Live Enquiry Status KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={activeTab === "orders" ? "Order Notifications" : "Client Inquiries"}
          value={tabScopedEnquiries.length}
          subtitle={`Showing ${filteredEnquiries.length} matching records`}
        />
        <StatCard
          label="New (Unread)"
          value={newCount}
          subtitle="Awaiting initial response"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          subtitle="In consultation"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          subtitle="Completed enquiries"
        />
      </div>

      {/* Filter & Export Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === "orders"
            ? "Search order #, customer, or total..."
            : "Search customer name, email, phone, or question..."
        }
      >
        <EnquiryFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <ExportButton
          filename="scents-mists-enquiries"
          sheetName="Enquiries"
          headers={[
            "ID",
            "Full Name",
            "Email",
            "Phone",
            "Subject",
            "Message",
            "Status",
            "Internal Notes",
            "Created At",
          ]}
          rows={exportRows}
          label="Export"
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={filteredEnquiries}
        ariaLabel="Customer enquiries table"
        emptyTitle={
          activeTab === "client"
            ? "No Customer Inquiries Yet"
            : "No Order Notifications"
        }
        emptyDescription={
          activeTab === "client"
            ? "When clients submit a question via /contact or the Concierge form, it will appear here."
            : "No order notifications found in the enquiries table."
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Enquiry"
        description={
          deleteTarget
            ? `Permanently delete this enquiry from ${deleteTarget.full_name}?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      {/* PURGE ORDER NOTIFICATIONS CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={isPurgeModalOpen}
        onOpenChange={setIsPurgeModalOpen}
        title="Clean Up Order Alerts from Enquiries?"
        description={`This will permanently remove the ${orderAlerts.length} mirrored "[NEW ORDER]" receipts from the enquiries inbox so it only shows customer messages. (Don't worry: your real customer orders remain 100% safe in the Orders Dashboard at /admin/orders).`}
        isLoading={isPurging}
        onConfirm={handlePurgeOrderAlerts}
      />
    </div>
  );
}
