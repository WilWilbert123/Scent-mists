"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { slugify } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { createCollectionAction } from "@/actions/collection.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProductImageUpload } from "@/components/admin/products/product-image-upload";
import { toast } from "@/components/ui/toast";

export function CollectionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(
    "/images/lifestyle/collection-altitude-botanicals.webp"
  );
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createCollectionAction({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        is_published: isPublished,
      });

      if (!res.success) {
        toast.error(res.error || "Unable to create collection.");
        return;
      }

      toast.success("Collection created.");
      router.push("/admin/collections");
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
            htmlFor="col-name"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Collection Name
          </label>
          <Input
            id="col-name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Altitude Botanicals"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="col-slug"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            URL Slug
          </label>
          <Input
            id="col-slug"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="altitude-botanicals"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="col-desc"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Collection Description
        </label>
        <Textarea
          id="col-desc"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the thematic character of this fragrance collection..."
        />
      </div>

      <ProductImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        bucket={STORAGE_BUCKETS.COLLECTIONS}
        label="Collection Cover Image"
      />

      <div className="border-t border-border pt-4">
        <label className="inline-flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Published on Public Website</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/collections")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSubmitting ? "Creating..." : "Create Collection"}</span>
        </Button>
      </div>
    </form>
  );
}

