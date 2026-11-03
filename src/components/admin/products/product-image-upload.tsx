"use client";

import React, { useId, useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { validateImageUpload } from "@/lib/validations";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { useSupabase } from "@/providers/supabase-provider";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
}

export function ProductImageUpload({
  value,
  onChange,
  bucket = STORAGE_BUCKETS.PRODUCTS,
  label = "Showcase Image URL or Upload",
}: ProductImageUploadProps) {
  const inputId = useId();
  const { supabase, isConfigured } = useSupabase();
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validation = validateImageUpload({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    if (!validation.valid || !validation.safeFilename) {
      const msg = validation.error || "Invalid image file.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!isConfigured || !supabase) {
      const msg =
        "Supabase Storage is not configured in .env.local. You can still provide a local /images/... path below.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsUploading(true);
    setProgress(25);

    try {
      const filePath = `uploads/${validation.safeFilename}`;
      setProgress(60);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setErrorMsg(uploadError.message);
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);
      onChange(publicUrlData.publicUrl);
      toast.success("Image uploaded to Supabase Storage.");
    } catch {
      setErrorMsg("Unexpected error during image upload.");
      toast.error("Unexpected error during image upload.");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 600);
    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={`${inputId}-url`}
        className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
      >
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          id={`${inputId}-url`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/products/himalayan-cherry-blossom.webp"
          className="flex-1"
        />

        <label
          htmlFor={`${inputId}-file`}
          className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border border-border bg-surface px-4 py-2 text-xs uppercase tracking-[0.16em] text-foreground hover:border-accent"
        >
          <Upload className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          <input
            id={`${inputId}-file`}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/avif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="visually-hidden"
          />
        </label>
      </div>

      {isUploading && (
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-surface overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Uploading validated asset ({progress}%)...
          </p>
        </div>
      )}

      {errorMsg && (
        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </p>
      )}

      {!errorMsg && value && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Active asset path: {value}</span>
        </p>
      )}
    </div>
  );
}

