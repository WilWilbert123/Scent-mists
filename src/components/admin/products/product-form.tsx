"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Product, ProductFormValues, ProductGender, ProductVolume, ProductStatus } from "@/types/product";
import { slugify } from "@/lib/utils";
import {
  createProductAction,
  updateProductAction,
} from "@/actions/product.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductImageUpload } from "./product-image-upload";
import { toast } from "@/components/ui/toast";

interface ProductFormProps {
  initialProduct?: Product | null;
  mode: "create" | "edit";
}

export function ProductForm({ initialProduct, mode }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [brand, setBrand] = useState(initialProduct?.brand || "Victoria's Secret");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [volume, setVolume] = useState<ProductVolume>(initialProduct?.volume || "50ml");
  const [gender, setGender] = useState<ProductGender>(initialProduct?.gender || "female");
  const [price, setPrice] = useState<number>(initialProduct?.price || 199);
  const [originalPrice, setOriginalPrice] = useState<number>(initialProduct?.original_price || 260);
  const [stock, setStock] = useState<number>(initialProduct?.stock || 25);
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || "in_stock");

  const [fragranceFamily, setFragranceFamily] = useState(
    initialProduct?.fragrance_family || "Fruity Floral"
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );
  const [topNotesText, setTopNotesText] = useState(
    initialProduct?.top_notes?.join(", ") ||
      "Peach Nectar, Crisp Red Apple"
  );
  const [heartNotesText, setHeartNotesText] = useState(
    initialProduct?.heart_notes?.join(", ") ||
      "Night Jasmine, Pink Freesia"
  );
  const [baseNotesText, setBaseNotesText] = useState(
    initialProduct?.base_notes?.join(", ") ||
      "Vanilla Orchid, White Amber"
  );
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.image_url || "/images/products/sakura-mountain-mist.webp"
  );
  const [galleryText] = useState(
    initialProduct?.gallery?.join(", ") ||
      initialProduct?.image_url ||
      "/images/products/sakura-mountain-mist.webp"
  );
  const [isFeatured, setIsFeatured] = useState(
    initialProduct?.is_featured ?? false
  );
  const [isPublished, setIsPublished] = useState(
    initialProduct?.is_published ?? true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === "create") {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: ProductFormValues = {
      name: name.trim(),
      slug: slug.trim(),
      brand: brand.trim(),
      sku: sku.trim() || undefined,
      volume,
      gender,
      price: Number(price),
      original_price: Number(originalPrice),
      stock: Number(stock),
      status,
      fragrance_family: fragranceFamily.trim(),
      description: description.trim(),
      top_notes: topNotesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      heart_notes: heartNotesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      base_notes: baseNotesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      image_url: imageUrl.trim(),
      gallery: Array.from(
        new Set([
          imageUrl.trim(),
          ...galleryText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ])
      ).filter(Boolean),
      collection_id: initialProduct?.collection_id ?? null,
      is_featured: isFeatured,
      is_published: isPublished,
    };

    try {
      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(initialProduct!.id, payload);

      if (!result.success) {
        toast.error(result.error || "Unable to save perfume entry.");
        return;
      }

      toast.success(
        mode === "create"
          ? "Perfume entry created and added to inventory."
          : "Perfume entry updated."
      );
      router.push("/admin/products");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8 rounded-xl"
    >
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="prod-name"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Perfume Name *
          </label>
          <Input
            id="prod-name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. VS - Bombshell (CVS03)"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-brand"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Brand
          </label>
          <Input
            id="prod-brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Victoria's Secret, Bvlgari"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="prod-sku"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            SKU Code
          </label>
          <Input
            id="prod-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="CVS03, CCK02"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-volume"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Volume Size
          </label>
          <Select
            id="prod-volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value as ProductVolume)}
            options={[
              { label: "50ml Aroma Body Mist", value: "50ml" },
              { label: "85ml Eau de Parfum", value: "85ml" },
              { label: "100ml Signature Flacon", value: "100ml" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-gender"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Target Audience
          </label>
          <Select
            id="prod-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as ProductGender)}
            options={[
              { label: "Female Perfume", value: "female" },
              { label: "Male Perfume", value: "male" },
              { label: "Unisex / Universal", value: "unisex" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-status"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Stock Status
          </label>
          <Select
            id="prod-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            options={[
              { label: "In Stock", value: "in_stock" },
              { label: "Low Stock", value: "low_stock" },
              { label: "Out of Stock", value: "out_of_stock" },
            ]}
          />
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-border py-4">
        <div className="space-y-1.5">
          <label
            htmlFor="prod-price"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Selling Price (PHP ₱) *
          </label>
          <Input
            id="prod-price"
            type="number"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="199"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-orig-price"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Original Slash Price (PHP ₱)
          </label>
          <Input
            id="prod-orig-price"
            type="number"
            min="0"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            placeholder="260"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-stock"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Inventory Stock (Units Available) *
          </label>
          <Input
            id="prod-stock"
            type="number"
            min="0"
            required
            value={stock}
            onChange={(e) => {
              const val = Number(e.target.value);
              setStock(val);
              if (val === 0) setStatus("out_of_stock");
              else if (val <= 10) setStatus("low_stock");
              else setStatus("in_stock");
            }}
            placeholder="25"
          />
        </div>
      </div>

      {/* URL & Fragrance Family */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="prod-slug"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            URL Slug
          </label>
          <Input
            id="prod-slug"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="aroma-body-mist-50ml-vs-bombshell"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-family"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Fragrance Family
          </label>
          <Input
            id="prod-family"
            value={fragranceFamily}
            onChange={(e) => setFragranceFamily(e.target.value)}
            placeholder="Fruity Floral Gourmand, Citrus Marine, etc."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="prod-description"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Description &amp; Scent Notes
        </label>
        <Textarea
          id="prod-description"
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the scent characteristics and opening accords..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="prod-top-notes"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Top Notes (Comma separated)
          </label>
          <Input
            id="prod-top-notes"
            required
            value={topNotesText}
            onChange={(e) => setTopNotesText(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-heart-notes"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Heart Notes (Comma separated)
          </label>
          <Input
            id="prod-heart-notes"
            required
            value={heartNotesText}
            onChange={(e) => setHeartNotesText(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prod-base-notes"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Base Notes (Comma separated)
          </label>
          <Input
            id="prod-base-notes"
            required
            value={baseNotesText}
            onChange={(e) => setBaseNotesText(e.target.value)}
          />
        </div>
      </div>

      <ProductImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        label="Primary Perfume Visual"
      />

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
        <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Published on Storefront</span>
        </label>

        <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Featured Main Fragrance</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Add Perfume to Inventory"
              : "Save Changes"}
          </span>
        </Button>
      </div>
    </form>
  );
}
