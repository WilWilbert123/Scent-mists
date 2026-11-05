"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Pencil,
  X,
  Save,
} from "lucide-react";
import type { Product, ProductGender, ProductStatus, ProductVolume } from "@/types/product";
import {
  deleteProductAction,
  updateProductStockAction,
  updateProductAction,
} from "@/actions/product.actions";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { TableToolbar } from "@/components/admin/shared/table-toolbar";
import { ExportButton } from "@/components/admin/shared/export-button";
import { ProductMassUploadDialog } from "./product-mass-upload-dialog";
import { ProductImageUpload } from "./product-image-upload";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { toast } from "@/components/ui/toast";

interface ProductTableProps {
  initialProducts: Product[];
}

export function ProductTable({ initialProducts }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const inStockCount = useMemo(
    () => products.filter((p) => p.status !== "out_of_stock" && (p.stock ?? 20) > 0).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.status === "out_of_stock" || (p.stock ?? 20) <= 0).length,
    [products]
  );
  const mistCount = useMemo(
    () => products.filter((p) => p.volume === "50ml").length,
    [products]
  );
  const perfumeCount = useMemo(
    () => products.filter((p) => p.volume === "85ml").length,
    [products]
  );

  // Quick Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    price: 199,
    original_price: 260,
    stock: 20,
    status: "in_stock" as ProductStatus,
    volume: "50ml" as ProductVolume,
    gender: "female" as ProductGender,
    image_url: "",
    is_main_male: false,
    is_main_female: false,
    is_featured: false,
    fragrance_family: "",
    description: "",
    top_notes: "",
    heart_notes: "",
    base_notes: "",
  });

  const handleStartEdit = useCallback((prod: Product) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      brand: prod.brand || "SCENTS & MISTS",
      price: prod.price || 199,
      original_price: prod.original_price || Math.round((prod.price || 199) * 1.25),
      stock: prod.stock ?? 20,
      status: prod.status || "in_stock",
      volume: (prod.volume as ProductVolume) || "50ml",
      gender: (prod.gender as ProductGender) || "female",
      image_url: prod.image_url || "",
      is_main_male: Boolean(prod.is_main_male),
      is_main_female: Boolean(prod.is_main_female),
      is_featured: Boolean(prod.is_featured),
      fragrance_family: prod.fragrance_family || "",
      description: prod.description || "",
      top_notes: prod.top_notes?.join(", ") || "",
      heart_notes: prod.heart_notes?.join(", ") || "",
      base_notes: prod.base_notes?.join(", ") || "",
    });
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        price: Number(editForm.price),
        original_price: Number(editForm.original_price),
        stock: Number(editForm.stock),
        status: editForm.status,
        volume: editForm.volume,
        gender: editForm.gender,
        image_url: editForm.image_url.trim() || editingProduct.image_url,
        is_main_male: editForm.is_main_male,
        is_main_female: editForm.is_main_female,
        is_featured: editForm.is_featured,
        fragrance_family: editForm.fragrance_family.trim(),
        description: editForm.description.trim(),
        top_notes: editForm.top_notes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        heart_notes: editForm.heart_notes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        base_notes: editForm.base_notes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await updateProductAction(editingProduct.id, payload);
      if (!res.success) {
        toast.error(res.error || "Failed to update perfume.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...payload,
                updated_at: new Date().toISOString(),
              }
            : p
        )
      );

      toast.success(`"${editForm.name}" updated successfully.`);
      setEditingProduct(null);
      router.refresh();
    } catch {
      toast.error("Error updating perfume.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.fragrance_family.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const exportRows = useMemo(() => {
    return filteredProducts.map((p) => [
      p.sku || "—",
      p.name,
      p.brand || "SCENTS & MISTS",
      p.volume || "50ml",
      p.price || 199,
      p.original_price || 250,
      p.stock ?? 20,
      p.status === "in_stock" ? "In Stock" : p.status === "low_stock" ? "Low Stock" : "Out of Stock",
      p.is_main_male ? "Male Main" : p.is_main_female ? "Female Main" : p.gender || "Unisex",
      p.rating || 5.0,
      p.rating_count || 0,
      p.sold_count || 0,
      p.is_featured ? "Yes" : "No",
      new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    ]);
  }, [filteredProducts]);

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

  // Quick toggle Out of Stock / In Stock
  const handleToggleStockStatus = useCallback(
    async (prod: Product) => {
      const isCurrentlyOut =
        prod.status === "out_of_stock" || (prod.stock ?? 20) <= 0;
      const nextStatus: ProductStatus = isCurrentlyOut ? "in_stock" : "out_of_stock";
      const nextStock = isCurrentlyOut ? 20 : 0;

      const res = await updateProductStockAction(prod.id, nextStock, nextStatus);
      if (!res.success) {
        toast.error(res.error || "Unable to update stock status.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, stock: nextStock, status: nextStatus } : p
        )
      );
      toast.success(
        `"${prod.name}" marked as ${nextStatus === "in_stock" ? "In Stock (20 available)" : "Out of Stock"}.`
      );
      router.refresh();
    },
    [router]
  );

  // Quick stock quantity update
  const handleUpdateStockQuantity = useCallback(
    async (prod: Product, newStock: number) => {
      const status: ProductStatus =
        newStock <= 0 ? "out_of_stock" : newStock <= 10 ? "low_stock" : "in_stock";

      const res = await updateProductStockAction(prod.id, newStock, status);
      if (!res.success) {
        toast.error(res.error || "Failed to update stock quantity.");
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, stock: newStock, status } : p
        )
      );
      toast.success(`Updated stock of "${prod.name}" to ${newStock}.`);
      router.refresh();
    },
    [router]
  );

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Perfume & Brand",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded border border-border bg-surface">
              <Image
                src={row.original.image_url}
                alt={row.original.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-accent font-bold">
                  {row.original.brand || "SCENTS & MISTS"}
                </span>
                {row.original.sku && (
                  <span className="text-[9px] font-mono text-muted-foreground border border-border px-1 rounded">
                    {row.original.sku}
                  </span>
                )}
              </div>
              <p className="font-medium text-foreground text-xs truncate max-w-[200px]">
                {row.original.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {row.original.volume || "50ml"} • {row.original.fragrance_family}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price (PHP)",
        cell: ({ row }) => (
          <div className="font-mono text-xs font-bold text-foreground">
            ₱{(row.original.price || 199).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Inventory Stock",
        cell: ({ row }) => {
          const currentStock = row.original.stock ?? 20;
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="999"
                defaultValue={currentStock}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val !== currentStock) {
                    void handleUpdateStockQuantity(row.original, val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val)) {
                      void handleUpdateStockQuantity(row.original, val);
                    }
                  }
                }}
                className="w-16 px-2 py-1 text-xs font-mono font-medium border border-border rounded bg-surface text-foreground text-center focus:outline-none focus:ring-1 focus:ring-accent"
                title="Edit stock quantity and press Enter or click away"
              />
              <span className="text-[10px] text-muted-foreground">units</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Stock Status Tag",
        cell: ({ row }) => {
          const isOut =
            row.original.status === "out_of_stock" || (row.original.stock ?? 20) <= 0;
          const isLow =
            row.original.status === "low_stock" ||
            ((row.original.stock ?? 20) > 0 && (row.original.stock ?? 20) <= 10);

          return (
            <button
              type="button"
              onClick={() => handleToggleStockStatus(row.original)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border"
              title="Click to toggle In Stock / Out of Stock"
            >
              {isOut ? (
                <span className="inline-flex items-center gap-1 text-rose-500 bg-rose-500/10 border-rose-500/30 px-2 py-0.5 rounded-full text-[10px]">
                  <XCircle className="h-3 w-3" />
                  Out of Stock
                </span>
              ) : isLow ? (
                <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 border-amber-500/30 px-2 py-0.5 rounded-full text-[10px]">
                  <AlertCircle className="h-3 w-3" />
                  Low Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-500 bg-emerald-500/10 border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  In Stock
                </span>
              )}
            </button>
          );
        },
      },
      {
        accessorKey: "gender",
        header: "Highlight Tag",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 text-[10px]">
            {row.original.is_main_male && (
              <span className="rounded bg-blue-500/20 text-blue-500 border border-blue-500/30 px-1.5 py-0.5 font-bold uppercase w-fit">
                Male Pick
              </span>
            )}
            {row.original.is_main_female && (
              <span className="rounded bg-pink-500/20 text-pink-500 border border-pink-500/30 px-1.5 py-0.5 font-bold uppercase w-fit">
                Female Pick
              </span>
            )}
            {!row.original.is_main_male && !row.original.is_main_female && (
              <span className="text-muted-foreground uppercase">
                {row.original.gender || "Unisex"}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStartEdit(row.original)}
              aria-label={`Edit ${row.original.name}`}
              className="inline-flex h-8 items-center gap-1.5 px-2.5 border border-border bg-surface text-foreground hover:border-accent hover:text-accent rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              title="Edit Perfume Details"
            >
              <Pencil className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>Edit</span>
            </button>
            <Link
              href={`/products/${row.original.slug}`}
              target="_blank"
              aria-label={`View public page for ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground hover:border-accent rounded transition-colors"
              title="View on Storefront"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              aria-label={`Delete ${row.original.name}`}
              className="inline-flex h-8 w-8 items-center justify-center border border-border bg-surface text-red-500 hover:border-red-500 rounded cursor-pointer transition-colors"
              title="Delete Perfume"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ),
      },
    ],
    [handleToggleStockStatus, handleUpdateStockQuantity, handleStartEdit]
  );

  return (
    <div className="space-y-6">
      {/* Real-time sync bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground rounded-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            <strong>Inventory Control Active:</strong> Update stock count directly in the table, or click any stock pill to tag an item as <strong>Out of Stock</strong>. Changes reflect instantly on customer storefront.
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent rounded-lg"
          >
            <RefreshCw
              className={cn("h-3 w-3", isPending && "animate-spin text-accent")}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Inventory KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Perfume SKUs"
          value={products.length}
          subtitle="32+ active scents"
        />
        <StatCard
          label="Available In Stock"
          value={inStockCount}
          subtitle="Ready to order & dispatch"
        />
        <StatCard
          label="Out of Stock"
          value={outOfStockCount}
          subtitle="Marked sold out"
        />
        <StatCard
          label="Categories"
          value={`${mistCount} Mists / ${perfumeCount} EDP`}
          subtitle="50ml & 85ml collections"
        />
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by perfume name, brand (VS, Bvlgari, Clinique), SKU (CVS03)..."
      >
        <ProductMassUploadDialog
          existingProducts={products}
          onSuccess={handleManualRefresh}
        />
        <ExportButton
          filename="scents-mists-products-catalog"
          sheetName="Products"
          headers={[
            "SKU",
            "Product Name",
            "Brand",
            "Volume",
            "Price (PHP)",
            "Original Price (PHP)",
            "Stock",
            "Inventory Status",
            "Gender / Category",
            "Rating",
            "Review Count",
            "Units Sold",
            "Is Featured",
            "Created At",
          ]}
          rows={exportRows}
          label="Export Products"
        />
      </TableToolbar>

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
            ? `Are you sure you want to delete "${deleteTarget.name}" from the inventory?`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      {/* QUICK EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded border border-border bg-surface">
                  <Image
                    src={editingProduct.image_url}
                    alt={editingProduct.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                    Edit Fragrance Entry
                  </span>
                  <h3 className="text-lg font-serif font-bold text-foreground">
                    {editingProduct.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Edit Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Row 1: Perfume Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Perfume Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Row 2: Price, Original Price, Stock, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Original Price (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.original_price}
                    onChange={(e) => setEditForm({ ...editForm, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    required
                    value={editForm.stock}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const status = val <= 0 ? "out_of_stock" : val <= 10 ? "low_stock" : "in_stock";
                      setEditForm({ ...editForm, stock: val, status });
                    }}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Stock Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProductStatus })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Volume, Gender, Fragrance Family */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Bottle Volume
                  </label>
                  <select
                    value={editForm.volume}
                    onChange={(e) => setEditForm({ ...editForm, volume: e.target.value as ProductVolume })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="50ml">50ml Aroma Body Mist</option>
                    <option value="85ml">85ml VS Perfume</option>
                    <option value="100ml">100ml Eau de Parfum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Gender Category
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as ProductGender })}
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Fragrance Family
                  </label>
                  <input
                    type="text"
                    value={editForm.fragrance_family}
                    onChange={(e) => setEditForm({ ...editForm, fragrance_family: e.target.value })}
                    placeholder="e.g. Fruity Floral, Citrus Marine"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Row 4: Highlight Badges */}
              <div className="p-3 bg-surface rounded-xl border border-border space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Storefront Highlight Tags
                </span>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.is_main_male}
                      onChange={(e) => setEditForm({ ...editForm, is_main_male: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="font-semibold text-blue-500">Male Main Pick (Shows first for male scents)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.is_main_female}
                      onChange={(e) => setEditForm({ ...editForm, is_main_female: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="font-semibold text-pink-500">Female Main Pick (Shows first for female scents)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.is_featured}
                      onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">Featured on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                  Fragrance Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Notes description..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
                />
              </div>

              {/* Row 6: Olfactory Pyramid Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Top Notes
                  </label>
                  <input
                    type="text"
                    value={editForm.top_notes}
                    onChange={(e) => setEditForm({ ...editForm, top_notes: e.target.value })}
                    placeholder="Comma separated"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Heart Notes
                  </label>
                  <input
                    type="text"
                    value={editForm.heart_notes}
                    onChange={(e) => setEditForm({ ...editForm, heart_notes: e.target.value })}
                    placeholder="Comma separated"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground font-semibold">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    value={editForm.base_notes}
                    onChange={(e) => setEditForm({ ...editForm, base_notes: e.target.value })}
                    placeholder="Comma separated"
                    className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Product Visual / Supabase Storage Upload */}
              <div className="pt-2 border-t border-border">
                <ProductImageUpload
                  value={editForm.image_url}
                  onChange={(url) => setEditForm({ ...editForm, image_url: url })}
                  label="Showcase Visual (Upload New or Choose from Supabase)"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
                <Link
                  href={`/admin/products/${editingProduct.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Open Dedicated Full Page Editor</span>
                </Link>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    disabled={isSavingEdit}
                    className="px-4 py-2 text-xs bg-surface border border-border hover:border-foreground/30 text-foreground rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Save className={cn("h-3.5 w-3.5", isSavingEdit && "animate-spin")} />
                    <span>{isSavingEdit ? "Updating..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
