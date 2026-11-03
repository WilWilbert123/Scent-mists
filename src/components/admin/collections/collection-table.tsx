"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Trash2, Layers, RefreshCw, Edit, Save, X } from "lucide-react";
import type { Collection } from "@/types/collection";
import {
  deleteCollectionAction,
  updateCollectionAction,
} from "@/actions/collection.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDate } from "@/lib/format-date";
import { cn, slugify } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

interface CollectionTableProps {
  initialCollections: Collection[];
}

export function CollectionTable({ initialCollections }: CollectionTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (initialCollections.length === 0) {
      void getFromIndexedDB<Collection[]>("admin_collections_records").then((cached) => {
        if (cached && cached.length > 0) {
          setCollections(cached);
        }
      });
    } else {
      setCollections(initialCollections);
      void saveToIndexedDB("admin_collections_records", initialCollections);
    }
  }, [initialCollections]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-collections-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
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

  const handleStartEdit = (col: Collection) => {
    setEditTarget(col);
    setEditName(col.name);
    setEditSlug(col.slug);
    setEditDescription(col.description);
    setEditImageUrl(col.image_url);
    setEditPublished(col.is_published);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsSavingEdit(true);
    try {
      const res = await updateCollectionAction(editTarget.id, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim(),
        image_url: editImageUrl.trim(),
        is_published: editPublished,
      });

      if (!res.success) {
        toast.error(res.error || "Unable to update collection.");
        return;
      }

      setCollections((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? {
                ...c,
                name: editName.trim(),
                slug: editSlug.trim(),
                description: editDescription.trim(),
                image_url: editImageUrl.trim(),
                is_published: editPublished,
                updated_at: new Date().toISOString(),
              }
            : c
        )
      );
      toast.success(`${editName.trim()} updated in Supabase.`);
      setEditTarget(null);
      router.refresh();
    } finally {
      setIsSavingEdit(false);
    }
  };

  const publishedCount = useMemo(
    () => collections.filter((c) => c.is_published).length,
    [collections]
  );
  const draftCount = collections.length - publishedCount;

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  const handleTogglePublished = async (col: Collection) => {
    const nextState = !col.is_published;
    const res = await updateCollectionAction(col.id, {
      name: col.name,
      slug: col.slug,
      description: col.description,
      image_url: col.image_url,
      is_published: nextState,
    });
    if (!res.success) {
      toast.error(res.error || "Unable to update collection status.");
      return;
    }
    setCollections((prev) =>
      prev.map((c) =>
        c.id === col.id ? { ...c, is_published: nextState } : c
      )
    );
    toast.success(
      `${col.name} ${nextState ? "published" : "unpublished"}.`
    );
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteCollectionAction(deleteTarget.id);
      if (!res.success) {
        toast.error(res.error || "Unable to delete collection.");
        return;
      }
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Collection deleted.");
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Collection & Route",
        cell: ({ row }) => (
          <div className="flex items-center gap-3.5">
            <div className="relative h-11 w-16 shrink-0 overflow-hidden border border-border bg-surface">
              <Image
                src={`${row.original.image_url}?v=2`}
                alt={row.original.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-serif text-base font-medium text-foreground">
                {row.original.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                /collections/{row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Editorial Description",
        cell: ({ row }) => (
          <p className="line-clamp-2 max-w-md text-xs text-muted-foreground">
            {row.original.description}
          </p>
        ),
      },
      {
        id: "assigned_fragrances",
        header: "Assigned Fragrances",
        cell: ({ row }) => {
          const slugs = row.original.product_slugs ?? [];
          if (slugs.length === 0) {
            return (
              <span className="text-xs text-muted-foreground">
                0 assigned
              </span>
            );
          }
          return (
            <div className="space-y-1">
              <span className="text-xs font-medium text-foreground">
                {slugs.length} {slugs.length === 1 ? "fragrance" : "fragrances"}
              </span>
              <div className="flex flex-wrap gap-1">
                {slugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/products/${slug}`}
                    target="_blank"
                    className="inline-block border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                  >
                    /{slug}
                  </Link>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "is_published",
        header: "Status",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleTogglePublished(row.original)}
            title="Click to toggle publish status"
          >
            {row.original.is_published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="warning">Unpublished</Badge>
            )}
          </button>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Last Synced",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDisplayDate(row.original.updated_at || row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStartEdit(row.original)}
              aria-label={`Edit ${row.original.name}`}
              title={`Edit ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <Edit className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <Link
              href={`/collections/${row.original.slug}`}
              target="_blank"
              aria-label={`View ${row.original.name} on public website`}
              title={`View ${row.original.name} on public website`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              aria-label={`Delete ${row.original.name}`}
              title={`Delete ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-red-600 hover:border-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Live Supabase Connection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Live <code className="font-mono">public.collections</code> table in Supabase • Click any collection badge to toggle public visibility immediately.
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

      {/* Live Collections KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Collections"
          value={collections.length}
          subtitle="Stored in public.collections"
        />
        <StatCard
          label="Published Chapters"
          value={publishedCount}
          subtitle="Visible on /collections & homepage"
        />
        <StatCard
          label="Unpublished Drafts"
          value={draftCount}
          subtitle="Hidden from public showcase"
        />
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search collections..."
      />

      {editTarget && (
        <form
          onSubmit={handleSaveEdit}
          className="space-y-5 border border-accent/50 bg-surface-elevated p-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Edit Collection: {editTarget.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Updates directly in <code className="font-mono">public.collections</code> ({editTarget.id})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              aria-label="Cancel editing collection"
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-muted-foreground hover:border-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-col-name"
                className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
              >
                Collection Name
              </label>
              <Input
                id="edit-col-name"
                required
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setEditSlug(slugify(e.target.value));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-col-slug"
                className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
              >
                URL Slug
              </label>
              <Input
                id="edit-col-slug"
                required
                value={editSlug}
                onChange={(e) => setEditSlug(slugify(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-col-desc"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Editorial Description
            </label>
            <Textarea
              id="edit-col-desc"
              required
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-col-image"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Cover Image Path / URL
            </label>
            <Input
              id="edit-col-image"
              required
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={editPublished}
                onChange={(e) => setEditPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Published on Public Website</span>
            </label>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingEdit}>
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isSavingEdit ? "Saving..." : "Save Collection"}</span>
              </Button>
            </div>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        ariaLabel="Fragrance collections table"
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Collection"
        description={
          deleteTarget
            ? `Are you sure you want to delete the "${deleteTarget.name}" collection?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

