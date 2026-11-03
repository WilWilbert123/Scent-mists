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
} from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/types/enquiry";
import { formatDisplayDateTime, formatRelativeTime } from "@/lib/format-date";
import {
  deleteEnquiryAction,
  updateEnquiryStatusAction,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Live KPI breakdowns from `public.enquiries`
  const newCount = useMemo(
    () => enquiries.filter((e) => e.status === "NEW").length,
    [enquiries]
  );
  const pendingCount = useMemo(
    () => enquiries.filter((e) => e.status === "PENDING").length,
    [enquiries]
  );
  const resolvedCount = useMemo(
    () => enquiries.filter((e) => e.status === "RESOLVED").length,
    [enquiries]
  );

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
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
  }, [enquiries, statusFilter, searchQuery]);

  const handleQuickStatus = useCallback(async (id: string, status: EnquiryStatus) => {
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
  }, [router]);

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
        cell: ({ row }) => (
          <div className="max-w-md space-y-1">
            <p className="font-medium text-foreground line-clamp-1">
              {row.original.subject}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.message}
            </p>
            {row.original.internal_notes && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-accent">
                <FileText className="h-3 w-3" aria-hidden="true" />
                <span>Internal Note Attached</span>
              </span>
            )}
          </div>
        ),
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/enquiries/${row.original.id}`}
              aria-label={`View enquiry from ${row.original.full_name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => handleQuickStatus(row.original.id, "PENDING")}
              title="Mark as Pending"
              aria-label={`Mark enquiry from ${row.original.full_name} as Pending`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickStatus(row.original.id, "RESOLVED")}
              title="Mark as Resolved"
              aria-label={`Mark enquiry from ${row.original.full_name} as Resolved`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-emerald-600 hover:border-emerald-600"
            >
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              title="Delete Enquiry"
              aria-label={`Delete enquiry from ${row.original.full_name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-red-600 hover:border-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ),
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Connected to <code className="font-mono">public.enquiries</code> in Supabase • Submissions from <code className="font-mono">/contact</code> and the homepage concierge form stream here in real time.
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

      {/* Live Enquiry Status KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Enquiries"
          value={enquiries.length}
          subtitle={`Showing ${filteredEnquiries.length} matching records`}
        />
        <StatCard
          label="New (Unread)"
          value={newCount}
          subtitle="Awaiting initial concierge triage"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          subtitle="Active client consultations"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          subtitle="Completed concierge enquiries"
        />
      </div>

      {/* Filter & Export Toolbar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by reference ID, client name, email, phone, or subject..."
      >
        <EnquiryFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <ExportButton
          filename="scents-mists-enquiries"
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
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={filteredEnquiries}
        ariaLabel="Customer enquiries table"
        emptyTitle="No Customer Enquiries Recorded in Supabase Yet"
        emptyDescription="When clients submit an enquiry via /contact or the homepage Concierge form, it is stored in public.enquiries and appears here in real time."
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Enquiry"
        description={
          deleteTarget
            ? `Permanently delete the enquiry from ${deleteTarget.full_name}?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

