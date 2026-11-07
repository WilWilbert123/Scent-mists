"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  Database,
  ExternalLink,
  ImageIcon,
  Upload,
  Images,
  ArrowUp,
  ArrowDown,
  Copy,
  CheckCircle2,
  Loader2,
  X,
  Search,
  Eye,
} from "lucide-react";
import type { BannerItemConfig } from "@/types/admin";
import { updateBannersContentAction } from "@/actions/content.actions";
import {
  uploadProductImageAction,
  getUploadedStorageImagesAction,
} from "@/actions/product.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface BannerManagerProps {
  initialBanners: BannerItemConfig[];
  updatedAt?: string | null;
}

interface StorageImageItem {
  name: string;
  url: string;
  created_at?: string;
  size?: number;
}

const CURATED_BACKGROUND_PRESETS = [
  { label: "🌸 Alpine Sakura", url: "/images/lifestyle/alpine-sakura-horizon.webp" },
  { label: "🏔️ Mountain Mist", url: "/images/hero/mountain-mist.webp" },
  { label: "🍃 Botanical Vista", url: "/images/lifestyle/altitude-botanicals-vista.webp" },
  { label: "✨ Flacon Showcase", url: "/images/lifestyle/fragrance-collection.webp" },
  { label: "🌸 Cherry Petals", url: "/images/hero/botanical-sakura-petals.webp" },
  { label: "🍵 White Tea Terraces", url: "/images/hero/botanical-white-tea-terraces.webp" },
  { label: "🌹 Velvet Rose & Oud", url: "/images/lifestyle/banner-velvet-rose-oud.webp" },
  { label: "🌙 Midnight Orchid", url: "/images/lifestyle/banner-midnight-orchid.webp" },
  { label: "🍊 Sunlit Bergamot", url: "/images/lifestyle/banner-citrus-bergamot.webp" },
  { label: "🪵 Smoked Sandalwood", url: "/images/lifestyle/banner-sandalwood-amber.webp" },
  { label: "🌲 Himalayan Timberline", url: "/images/hero/botanical-deodar-timberline.webp" },
  { label: "🌌 Twilight Blossom", url: "/images/hero/himalayan-cherry-blossom-dark-bg.webp" },
];

/**
 * Client-side compression for high-resolution images
 */
async function compressImageFile(file: File, maxDimension = 1920, quality = 0.88): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size <= 500 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = objectUrl;
  });
}

export function BannerManager({ initialBanners, updatedAt }: BannerManagerProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItemConfig[]>(initialBanners);
  const [isSaving, setIsSaving] = useState(false);

  // Storage Library Modal State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeBannerForLibrary, setActiveBannerForLibrary] = useState<string | null>(null);
  const [libraryImages, setLibraryImages] = useState<StorageImageItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryBucket, setLibraryBucket] = useState<"site-assets" | "product-images">("site-assets");

  // Per-banner upload states (keyed by banner.id)
  const [uploadingBanners, setUploadingBanners] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Bulk upload state (Upload 1 to 15 images at once)
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; percent: number }>({
    current: 0,
    total: 0,
    percent: 0,
  });
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  // Real-time synchronization with Supabase site_content
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-banners-editor-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
          filter: "content_key=eq.banners",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  // Add a new blank or preset banner
  const handleAddBanner = () => {
    const id = `banner-${Date.now()}`;
    const newBanner: BannerItemConfig = {
      id,
      title: "New Showcase Banner",
      subtitle: "Discover iconic floral notes and oil-rich sillage with Cash on Delivery.",
      ctaText: "Shop Collection",
      ctaHref: "/shop",
      imageUrl: "/images/lifestyle/fragrance-collection.webp",
      isActive: true,
      placement: "shop",
    };
    setBanners((prev) => [...prev, newBanner]);
    toast.success("New banner card added. Configure and click Save.");
  };

  const handleDuplicate = (index: number) => {
    const source = banners[index];
    if (!source) return;
    const duplicated: BannerItemConfig = {
      ...source,
      id: `banner-${Date.now()}`,
      title: `${source.title} (Copy)`,
    };
    const next = [...banners];
    next.splice(index + 1, 0, duplicated);
    setBanners(next);
    toast.success(`Duplicated Banner #${index + 1}.`);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setBanners((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    setBanners((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemove = (id: string, title: string) => {
    if (confirm(`Remove banner "${title}"?`)) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner removed.");
    }
  };

  const handleUpdate = <K extends keyof BannerItemConfig>(
    id: string,
    key: K,
    value: BannerItemConfig[K]
  ) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [key]: value } : b))
    );
  };

  // Direct upload to Supabase Storage
  const handleFileUpload = async (bannerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanners((prev) => ({ ...prev, [bannerId]: true }));
    setUploadProgress((prev) => ({ ...prev, [bannerId]: 25 }));

    try {
      const optimizedFile = await compressImageFile(file);
      setUploadProgress((prev) => ({ ...prev, [bannerId]: 60 }));

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("bucket", "site-assets");

      const res = await uploadProductImageAction(formData);
      setUploadProgress((prev) => ({ ...prev, [bannerId]: 95 }));

      if (!res.success || !res.url) {
        toast.error(res.error || "Failed to upload image.");
        return;
      }

      handleUpdate(bannerId, "imageUrl", res.url);
      toast.success("Image uploaded to Supabase Storage.");
    } catch {
      toast.error("An error occurred during upload.");
    } finally {
      setUploadingBanners((prev) => ({ ...prev, [bannerId]: false }));
      setUploadProgress((prev) => ({ ...prev, [bannerId]: 0 }));
      if (fileInputRefs.current[bannerId]) {
        fileInputRefs.current[bannerId]!.value = "";
      }
    }
  };

  // Open Supabase Storage Library Modal
  const handleOpenLibrary = async (bannerId: string, bucket: "site-assets" | "product-images" = "site-assets") => {
    setActiveBannerForLibrary(bannerId);
    setLibraryBucket(bucket);
    setIsLibraryOpen(true);
    setIsLoadingLibrary(true);

    try {
      const res = await getUploadedStorageImagesAction(bucket);
      if (res.success && res.images) {
        setLibraryImages(res.images);
      } else {
        // Try fallback bucket if empty
        const fallback = await getUploadedStorageImagesAction("product-images");
        if (fallback.success && fallback.images) {
          setLibraryImages(fallback.images);
        }
      }
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleSelectLibraryImage = (url: string) => {
    if (activeBannerForLibrary) {
      handleUpdate(activeBannerForLibrary, "imageUrl", url);
      toast.success("Selected image from Supabase Storage.");
    }
    setIsLibraryOpen(false);
    setActiveBannerForLibrary(null);
  };

  // Bulk Upload (1 to 15 images) with automatic banner card creation
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    if (rawFiles.length > 15) {
      toast.warning(`You selected ${rawFiles.length} images. Only the first 15 will be uploaded.`);
    }
    const selectedFiles = rawFiles.slice(0, 15);

    setIsBulkUploading(true);
    setBulkProgress({ current: 0, total: selectedFiles.length, percent: 5 });

    const newBanners: BannerItemConfig[] = [];
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const progressPercent = Math.round(((i + 1) / selectedFiles.length) * 95);
      setBulkProgress({ current: i + 1, total: selectedFiles.length, percent: progressPercent });

      try {
        const optimizedFile = await compressImageFile(file);
        const formData = new FormData();
        formData.append("file", optimizedFile);
        formData.append("bucket", "site-assets");

        const res = await uploadProductImageAction(formData);
        if (res.success && res.url) {
          const cleanTitle = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          newBanners.push({
            id: `banner-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            title: cleanTitle || `Showcase Slide #${banners.length + i + 1}`,
            subtitle: "Discover iconic floral notes and oil-rich sillage with Cash on Delivery.",
            ctaText: "Shop Collection",
            ctaHref: "/shop",
            imageUrl: res.url,
            isActive: true,
            placement: "shop",
          });
          successCount++;
        } else {
          toast.error(`Failed to upload ${file.name}: ${res.error || "Upload error"}`);
        }
      } catch {
        toast.error(`Error processing ${file.name}`);
      }
    }

    if (newBanners.length > 0) {
      setBanners((prev) => [...prev, ...newBanners]);
      toast.success(
        `Uploaded and added ${successCount} banner image${successCount > 1 ? "s" : ""}! Click "Save Banner Configuration" to make them live.`
      );
    }

    setIsBulkUploading(false);
    setBulkProgress({ current: 0, total: 0, percent: 0 });
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateBannersContentAction(banners);
      if (!res.success) {
        toast.error(res.error || "Unable to save banners.");
        return;
      }
      toast.success("Promotional & editorial banners saved to Supabase.");

      // Instant multi-tab broadcast sync across admin and shop carousel
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("scent_mists_banners_channel");
          bc.postMessage({ type: "BANNERS_UPDATED", payload: banners });
          bc.close();
        }
      } catch {
        // ignore
      }

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLibraryImages = libraryImages.filter((img) =>
    img.name.toLowerCase().includes(librarySearch.toLowerCase())
  );

  const activeCount = banners.filter((b) => b.isActive).length;
  const shopCount = banners.filter((b) => b.placement === "shop" && b.isActive).length;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Status & Controls Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span>
              Database key: <code className="font-mono">site_content.banners</code>
              {updatedAt ? ` • Last synced ${formatDisplayDateTime(updatedAt)}` : ""}
            </span>
          </div>
          <span className="hidden sm:inline-block text-border">•</span>
          <span className="font-medium text-foreground whitespace-nowrap">
            {banners.length} total ({activeCount} active, {shopCount} in Shop Carousel)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start xl:self-center shrink-0">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground rounded-lg transition-colors hover:border-accent whitespace-nowrap shrink-0"
          >
            <span>Preview Shop Carousel</span>
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href="/collections"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground rounded-lg transition-colors hover:border-accent whitespace-nowrap shrink-0"
          >
            <span>Preview Collections</span>
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          </Link>

          {/* Hidden input for bulk uploading 1 to 15 images */}
          <input
            ref={bulkFileInputRef}
            type="file"
            multiple
            accept="image/webp,image/jpeg,image/png,image/avif"
            onChange={handleBulkUpload}
            disabled={isBulkUploading}
            className="hidden"
            id="bulk-banner-upload-input"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBulkUploading}
            onClick={() => bulkFileInputRef.current?.click()}
            className="cursor-pointer border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 whitespace-nowrap shrink-0"
            title="Select 1 to 15 images to automatically create carousel banners"
          >
            {isBulkUploading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>
              {isBulkUploading
                ? `Uploading (${bulkProgress.current}/${bulkProgress.total})...`
                : "Bulk Upload (1-15 Images)"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBanner}
            className="cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Banner</span>
          </Button>
        </div>
      </div>

      {/* Real-time Bulk Upload Progress Bar */}
      {isBulkUploading && (
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-accent font-medium">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                Optimizing &amp; uploading banner images ({bulkProgress.current} of {bulkProgress.total})...
              </span>
            </span>
            <span className="font-mono font-semibold">{bulkProgress.percent}%</span>
          </div>
          <div className="h-2 w-full bg-accent/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${bulkProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Banner Cards List */}
      <div className="space-y-6">
        {banners.map((banner, index) => {
          const isUploading = Boolean(uploadingBanners[banner.id]);
          const progress = uploadProgress[banner.id] || 0;
          const isSupabaseAsset = banner.imageUrl?.includes("supabase.co");

          return (
            <div
              key={banner.id}
              className="border border-border bg-surface-elevated p-5 sm:p-6 rounded-2xl shadow-xs space-y-5 transition-all"
            >
              {/* Card Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-lg font-semibold text-foreground">
                    Banner #{index + 1}
                  </span>

                  {/* Ordering Controls */}
                  <div className="flex items-center gap-1 border border-border rounded-lg bg-surface p-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      title="Move slide up"
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => handleMoveDown(index)}
                      title="Move slide down"
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Placement Select */}
                  <Select
                    value={banner.placement || "shop"}
                    onChange={(e) =>
                      handleUpdate(
                        banner.id,
                        "placement",
                        e.target.value as BannerItemConfig["placement"]
                      )
                    }
                    aria-label="Banner placement"
                    className="h-8 w-44 text-xs font-medium"
                  >
                    <option value="shop">Placement: Shop Carousel</option>
                    <option value="collection">Placement: Collection Page</option>
                    <option value="editorial">Placement: Editorial Callout</option>
                    <option value="announcement">Placement: Announcement</option>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  {/* Active Toggle */}
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={banner.isActive !== false}
                      onChange={(e) =>
                        handleUpdate(banner.id, "isActive", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className={cn(banner.isActive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                      {banner.isActive !== false ? "Active on Website" : "Inactive (Hidden)"}
                    </span>
                  </label>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(index)}
                    title="Duplicate banner"
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-md transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleRemove(banner.id, banner.title)}
                    title="Remove banner"
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Panoramic Live Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider font-medium flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-accent" />
                    <span>Live Carousel Preview</span>
                  </span>
                  <span className="text-[11px] font-mono">Panoramic 21:9 format</span>
                </div>

                <div className="relative aspect-[21/9] sm:aspect-[24/8] max-h-48 w-full overflow-hidden rounded-xl border border-border bg-neutral-900 shadow-inner group">
                  {banner.imageUrl ? (
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title || "Banner image preview"}
                      fill
                      unoptimized
                      className="object-cover object-center brightness-90 group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No image selected. Upload or pick from storage below.
                    </div>
                  )}

                  {/* Gradient overlay mirroring public shop carousel */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent p-4 sm:p-6 flex flex-col justify-center text-white">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#E8C6CE]">
                      {banner.placement === "shop" ? "Featured Showcase" : banner.placement || "Showcase"}
                    </span>
                    <h4 className="font-serif text-base sm:text-xl font-medium tracking-tight text-white drop-shadow-sm line-clamp-1 mt-0.5">
                      {banner.title || "Untitled Banner"}
                    </h4>
                    <p className="text-xs text-neutral-200 line-clamp-1 max-w-lg mt-0.5">
                      {banner.subtitle || "Banner subtitle description"}
                    </p>
                    {banner.ctaText && (
                      <span className="inline-flex items-center gap-1 mt-2.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white self-start border border-white/30">
                        <span>{banner.ctaText}</span>
                        <span>→</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Uploader & Storage Source */}
              <div className="rounded-xl border border-border/80 bg-surface/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-accent" />
                    <span>Banner Image Source</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLibrary(banner.id, "site-assets")}
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium cursor-pointer"
                    >
                      <Images className="h-3.5 w-3.5" />
                      <span>Browse Supabase Storage</span>
                    </button>
                  </div>
                </div>

                {/* Upload or URL Row */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <Input
                    value={banner.imageUrl || ""}
                    placeholder="https://...supabase.co/... or /images/..."
                    onChange={(e) => handleUpdate(banner.id, "imageUrl", e.target.value)}
                    className="flex-1 text-xs"
                  />

                  {/* Hidden file input */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[banner.id] = el;
                    }}
                    type="file"
                    accept="image/webp,image/jpeg,image/png,image/avif"
                    onChange={(e) => handleFileUpload(banner.id, e)}
                    disabled={isUploading}
                    className="hidden"
                    id={`file-upload-${banner.id}`}
                  />

                  <label
                    htmlFor={`file-upload-${banner.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-xs font-medium text-foreground hover:border-accent hover:bg-surface cursor-pointer shrink-0 transition-colors shadow-2xs"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-accent" />
                    )}
                    <span>{isUploading ? "Uploading..." : "Upload New File"}</span>
                  </label>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-surface overflow-hidden rounded-full">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Uploading to Supabase Storage ({progress}%)...
                    </p>
                  </div>
                )}

                {/* Presets Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground shrink-0">
                    Curated presets:
                  </span>
                  {CURATED_BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleUpdate(banner.id, "imageUrl", preset.url)}
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap",
                        banner.imageUrl === preset.url
                          ? "border-accent bg-accent/15 text-foreground font-semibold"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-accent"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {banner.imageUrl && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-mono">{banner.imageUrl}</span>
                    {isSupabaseAsset && (
                      <span className="rounded bg-emerald-500/10 px-1 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                        Supabase Storage
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Banner Text Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Banner Title
                  </label>
                  <Input
                    value={banner.title}
                    placeholder="e.g. Victoria's Secret Luxe • 85ml"
                    onChange={(e) => handleUpdate(banner.id, "title", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Subtitle Description
                  </label>
                  <Input
                    value={banner.subtitle}
                    placeholder="e.g. 13 Iconic Designer Scents • Pure elegance"
                    onChange={(e) => handleUpdate(banner.id, "subtitle", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    CTA Button Label
                  </label>
                  <Input
                    value={banner.ctaText}
                    placeholder="e.g. Shop 85ml Luxe"
                    onChange={(e) => handleUpdate(banner.id, "ctaText", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    CTA Target Route
                  </label>
                  <Input
                    value={banner.ctaHref}
                    placeholder="e.g. /shop or /collections"
                    onChange={(e) => handleUpdate(banner.id, "ctaHref", e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-elevated/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddBanner}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Another Banner</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBulkUploading}
            onClick={() => bulkFileInputRef.current?.click()}
            className="cursor-pointer border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
          >
            {isBulkUploading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1.5" />
            )}
            <span>Bulk Upload (1-15 Images)</span>
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer font-medium px-6"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          <span>{isSaving ? "Saving to Supabase..." : "Save Banner Configuration"}</span>
        </Button>
      </div>

      {/* Supabase Storage Media Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-accent" />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Supabase Storage Media Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLibraryOpen(false);
                  setActiveBannerForLibrary(null);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bucket Switcher & Search */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Filter uploaded storage images..."
                  className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-surface">
                <button
                  type="button"
                  onClick={() => handleOpenLibrary(activeBannerForLibrary!, "site-assets")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer",
                    libraryBucket === "site-assets"
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  site-assets
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenLibrary(activeBannerForLibrary!, "product-images")}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer",
                    libraryBucket === "product-images"
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  product-images
                </button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto min-h-[280px] p-1">
              {isLoadingLibrary ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  <span>Loading images from Supabase Storage bucket &ldquo;{libraryBucket}&rdquo;...</span>
                </div>
              ) : filteredLibraryImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center text-muted-foreground text-xs">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  <p className="font-medium text-foreground">No images found in bucket &ldquo;{libraryBucket}&rdquo;.</p>
                  <p>Upload a file using the &ldquo;Upload New File&rdquo; button above to store images in Supabase.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredLibraryImages.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => handleSelectLibraryImage(img.url)}
                      className="group relative flex flex-col rounded-xl border border-border bg-surface p-2 hover:border-accent hover:shadow-md transition-all text-left cursor-pointer"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="mt-1.5 truncate text-[11px] font-medium text-foreground">
                        {img.name}
                      </span>
                      {img.size && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {Math.round(img.size / 1024)} KB
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border pt-3 flex justify-between items-center text-xs text-muted-foreground">
              <span>Showing {filteredLibraryImages.length} images in {libraryBucket}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLibraryOpen(false);
                  setActiveBannerForLibrary(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
