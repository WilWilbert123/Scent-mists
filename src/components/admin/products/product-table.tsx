"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import type { Product } from "@/types/product";
import { deleteProductAction, updateProductAction } from "@/actions/product.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

interface ProductTableProps {
  initialProducts: Product[];
}

export function ProductTable({ initialProducts }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialProducts.length === 0) {
      void getFromIndexedDB<Product[]>("admin_products_records").then((cached) => {
        if (cached && cached.length > 0) {
          setProducts(cached);
        }
      });
    } else {
      setProducts(initialProducts);
      void saveToIndexedDB("admin_products_records", initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-products-realtime")
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

  const publishedCount = useMemo(
    () => products.filter((p) => p.is_published).length,
    [products]
  );
  const featuredCount = useMemo(
    () => products.filter((p) => p.is_featured).length,
    [products]
  );
  const familiesCount = useMemo(
    () => new Set(products.map((p) => p.fragrance_family)).size,
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fragrance_family.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductAction(deleteTarget.id);
      if (!res.success) {
        toast.error(res.error || "Unable to delete product.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`Deleted ${deleteTarget.name}.`);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleTogglePublished = async (prod: Product) => {
    const nextState = !prod.is_published;
    const res = await updateProductAction(prod.id, {
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      fragrance_family: prod.fragrance_family,
      top_notes: prod.top_notes,
      heart_notes: prod.heart_notes,
      base_notes: prod.base_notes,
      image_url: prod.image_url,
      gallery: prod.gallery,
      collection_id: prod.collection_id ?? null,
      is_featured: prod.is_featured,
      is_published: nextState,
    });
    if (!res.success) {
      toast.error(res.error || "Unable to update visibility.");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_published: nextState } : p))
    );
    toast.success(
      `${prod.name} marked as ${nextState ? "Published" : "Draft"}.`
    );
    router.refresh();
  };

  const handleToggleFeatured = async (prod: Product) => {
    const nextState = !prod.is_featured;
    const res = await updateProductAction(prod.id, {
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      fragrance_family: prod.fragrance_family,
      top_notes: prod.top_notes,
      heart_notes: prod.heart_notes,
      base_notes: prod.base_notes,
      image_url: prod.image_url,
      gallery: prod.gallery,
      collection_id: prod.collection_id ?? null,
      is_featured: nextState,
      is_published: prod.is_published,
    });
    if (!res.success) {
      toast.error(res.error || "Unable to update featured status.");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, is_featured: nextState } : p))
    );
    toast.success(
      `${prod.name} marked as ${nextState ? "Signature Creation" : "Collection Edition"}.`
    );
    router.refresh();
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Fragrance & Slug",
        cell: ({ row }) => (
          <div className="flex items-center gap-3.5">
            <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-border bg-surface">
              <Image
                src={`${row.original.image_url}?v=2`}
                alt={row.original.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-serif text-base font-medium text-foreground">
                {row.original.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                /products/{row.original.slug}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "fragrance_family",
        header: "Olfactory Family",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.fragrance_family}</Badge>
        ),
      },
      {
        id: "notes_summary",
        header: "Olfactory Notes",
        cell: ({ row }) => {
          const totalNotes =
            (row.original.top_notes?.length || 0) +
            (row.original.heart_notes?.length || 0) +
            (row.original.base_notes?.length || 0);
          return (
            <div className="space-y-0.5 text-xs">
              <span className="font-medium text-foreground">
                {totalNotes} Botanical Notes
              </span>
              <p className="line-clamp-1 max-w-[220px] text-muted-foreground">
                {[
                  row.original.top_notes?.[0],
                  row.original.heart_notes?.[0],
                  row.original.base_notes?.[0],
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "is_published",
        header: "Visibility",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleTogglePublished(row.original)}
            title="Click to toggle Published / Draft in Supabase"
          >
            {row.original.is_published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="warning">Draft</Badge>
            )}
          </button>
        ),
      },
      {
        accessorKey: "is_featured",
        header: "Role",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleToggleFeatured(row.original)}
            title="Click to toggle Signature Creation / Collection Edition in Supabase"
          >
            {row.original.is_featured ? (
              <Badge variant="blossom">Signature Creation</Badge>
            ) : (
              <Badge variant="outline">Collection Edition</Badge>
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
            <Link
              href={`/products/${row.original.slug}`}
              target="_blank"
              aria-label={`View public page for ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link
              href={`/admin/products/${row.original.id}/edit`}
              aria-label={`Edit ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent"
            >
              <Edit className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              aria-label={`Delete ${row.original.name}`}
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
          <Sparkles className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Live <code className="font-mono">public.products</code> table in Supabase • Edits and new fragrance creations sync immediately with the public showcase.
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

      {/* Live Catalog KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Fragrances"
          value={products.length}
          subtitle="Stored in public.products"
        />
        <StatCard
          label="Published Showcase"
          value={publishedCount}
          subtitle="Live on /shop & homepage"
        />
        <StatCard
          label="Featured Creations"
          value={featuredCount}
          subtitle="Highlighted signature editions"
        />
        <StatCard
          label="Olfactory Families"
          value={familiesCount}
          subtitle="Distinct scent classifications"
        />
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search fragrances by name, slug, or olfactory family..."
      />

      <DataTable
        columns={columns}
        data={filteredProducts}
        ariaLabel="Fragrance showcase entries table"
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Fragrance Entry"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}" from the showcase?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

