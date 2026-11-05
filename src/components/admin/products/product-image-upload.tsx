"use client";

import React, { useId, useState } from "react";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Images,
  X,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  uploadProductImageAction,
  getUploadedStorageImagesAction,
} from "@/actions/product.actions";

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

interface StorageImageItem {
  name: string;
  url: string;
  created_at?: string;
  size?: number;
}

export function ProductImageUpload({
  value,
  onChange,
  bucket = STORAGE_BUCKETS.PRODUCTS,
  label = "Showcase Image URL or Upload",
}: ProductImageUploadProps) {
  const inputId = useId();
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Supabase Storage Gallery Modal State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<StorageImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsUploading(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      setProgress(50);
      const res = await uploadProductImageAction(formData);

      if (!res.success || !res.url) {
        const msg = res.error || "Upload failed.";
        setErrorMsg(msg);
        toast.error(`Upload error: ${msg}`);
        return;
      }

      setProgress(100);
      onChange(res.url);
      toast.success("Image successfully uploaded to Supabase Storage!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected upload error.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
      // Reset input value so same file can be re-selected if desired
      event.target.value = "";
    }
  };

  const handleOpenLibrary = async () => {
    setIsLibraryOpen(true);
    setIsLoadingLibrary(true);
    try {
      const res = await getUploadedStorageImagesAction(bucket);
      if (res.success && res.images) {
        setLibraryImages(res.images);
      } else {
        toast.error(res.error || "Failed to load Supabase storage images.");
      }
    } catch {
      toast.error("Failed to load Supabase storage images.");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const filteredLibrary = libraryImages.filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSupabaseAsset =
    value?.startsWith("https://") && value?.includes("supabase.co");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`${inputId}-url`}
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={handleOpenLibrary}
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium cursor-pointer"
        >
          <Images className="h-3.5 w-3.5" />
          <span>Browse Supabase Storage ({libraryImages.length > 0 ? libraryImages.length : "Browse"})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          id={`${inputId}-url`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://...supabase.co/storage/v1/object/public/... or /images/..."
          className="flex-1"
        />

        <label
          htmlFor={`${inputId}-file`}
          className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border border-border bg-surface px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground hover:border-accent rounded-lg transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          )}
          <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          <input
            id={`${inputId}-file`}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/avif,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="visually-hidden"
          />
        </label>
      </div>

      {isUploading && (
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-surface overflow-hidden rounded-full">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Uploading asset to Supabase Storage ({progress}%)...
          </p>
        </div>
      )}

      {errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </p>
      )}

      {/* Visual Preview Card if Value is Set */}
      {value && (
        <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-surface/70">
          <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-black/5 dark:bg-white/5">
            <Image
              src={value}
              alt="Uploaded perfume preview"
              fill
              unoptimized
              className="object-cover object-center"
              onError={(e) => {
                // If broken link, show subtle placeholder
                (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
              }}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-foreground truncate">
                {isSupabaseAsset ? "Supabase Storage Active Asset" : "Linked Image Asset"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground truncate" title={value}>
              {value}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Supabase Storage Browser Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface-elevated shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Images className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Supabase Storage Library
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bucket: <code className="font-mono text-accent">{bucket}/uploads</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="p-4 border-b border-border bg-surface/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter uploaded perfume images by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Grid of Images */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoadingLibrary ? (
                <div className="py-16 text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Loading images from Supabase Storage bucket...
                  </p>
                </div>
              ) : filteredLibrary.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">No images found</p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery
                      ? "No images matched your filter. Try searching for a different keyword."
                      : "No images found in the uploads folder. Click 'Upload File' to add some."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredLibrary.map((item) => {
                    const isSelected = value === item.url;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => {
                          onChange(item.url);
                          setIsLibraryOpen(false);
                          toast.success(`Selected image: ${item.name}`);
                        }}
                        className={`group relative flex flex-col rounded-xl border p-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                            : "border-border bg-surface hover:border-accent/60 hover:shadow-md"
                        }`}
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 mb-2">
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground p-1 rounded-full shadow">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-foreground font-medium truncate w-full" title={item.name}>
                          {item.name}
                        </span>
                        {item.size ? (
                          <span className="text-[10px] text-muted-foreground">
                            {(item.size / 1024).toFixed(0)} KB
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filteredLibrary.length} image{filteredLibrary.length === 1 ? "" : "s"} available
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="px-4 py-2 bg-surface border border-border hover:border-foreground/30 text-foreground rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
