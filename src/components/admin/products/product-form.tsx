"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Product, ProductFormValues } from "@/types/product";
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
  const [fragranceFamily, setFragranceFamily] = useState(
    initialProduct?.fragrance_family || "Floral Musky"
  );
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );
  const [topNotesText, setTopNotesText] = useState(
    initialProduct?.top_notes?.join(", ") ||
      "Crisp Mountain Air Accord, White Bergamot Mist"
  );
  const [heartNotesText, setHeartNotesText] = useState(
    initialProduct?.heart_notes?.join(", ") ||
      "Wild Cherry Blossom, Silver Needle White Tea"
  );
  const [baseNotesText, setBaseNotesText] = useState(
    initialProduct?.base_notes?.join(", ") ||
      "Cashmere Cedarwood, Soft Silk Musk"
  );
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.image_url || "/images/products/sakura-mountain-mist.webp"
  );
  const [galleryText, setGalleryText] = useState(
    initialProduct?.gallery?.join(", ") ||
      "/images/products/sakura-mountain-mist.webp, /images/products/morning-cedar-mist.webp"
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
      gallery: galleryText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
        toast.error(result.error || "Unable to save fragrance showcase entry.");
        return;
      }

      toast.success(
        mode === "create"
          ? "Fragrance showcase entry created."
          : "Fragrance showcase entry updated."
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
      className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="prod-name"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Fragrance Name
          </label>
          <Input
            id="prod-name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Sakura & Mountain Mist"
          />
        </div>

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
            placeholder="sakura-and-mountain-mist"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <label
          htmlFor="prod-family"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Fragrance Family
        </label>
        <Select
          id="prod-family"
          value={fragranceFamily}
          onChange={(e) => setFragranceFamily(e.target.value)}
          options={[
            { label: "Floral Musky", value: "Floral Musky" },
            { label: "Woody Aromatic", value: "Woody Aromatic" },
            { label: "Floral Green", value: "Floral Green" },
            { label: "Amber Floral", value: "Amber Floral" },
            { label: "Citrus Botanical", value: "Citrus Botanical" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="prod-description"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Editorial Description
        </label>
        <Textarea
          id="prod-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the olfactory inspiration and atmospheric character..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
        label="Primary Showcase Image"
      />

      <div className="space-y-1.5">
        <label
          htmlFor="prod-gallery"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Gallery Image Paths (Comma separated)
        </label>
        <Input
          id="prod-gallery"
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
        <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Published on Public Showcase</span>
        </label>

        <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Featured Signature Fragrance</span>
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
              ? "Create Fragrance Entry"
              : "Save Changes"}
          </span>
        </Button>
      </div>
    </form>
  );
}

