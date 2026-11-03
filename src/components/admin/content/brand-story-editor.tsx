"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Database, ExternalLink } from "lucide-react";
import type { BrandStoryContentConfig } from "@/types/admin";
import { updateBrandStoryContentAction } from "@/actions/content.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface BrandStoryEditorProps {
  initialStory: BrandStoryContentConfig;
  updatedAt?: string | null;
}

export function BrandStoryEditor({
  initialStory,
  updatedAt,
}: BrandStoryEditorProps) {
  const router = useRouter();
  const [story, setStory] = useState<BrandStoryContentConfig>(initialStory);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStory(initialStory);
  }, [initialStory]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-brand-story-editor-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
          filter: "content_key=eq.brand_story",
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

  const handleChange = <K extends keyof BrandStoryContentConfig>(
    key: K,
    value: BrandStoryContentConfig[K]
  ) => {
    setStory((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateBrandStoryContentAction(story);
      if (!res.success) {
        toast.error(res.error || "Unable to save brand story.");
        return;
      }
      toast.success("Brand story updated in Supabase and reflected on /about.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-border bg-surface-elevated p-6 sm:p-8"
    >
      {/* Live Supabase Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Database key: <code className="font-mono">site_content.brand_story</code>
            {updatedAt ? ` • Last synced ${formatDisplayDateTime(updatedAt)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent"
          >
            <span>Preview /about</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="bs-eyebrow"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Eyebrow Label
          </label>
          <Input
            id="bs-eyebrow"
            required
            value={story.eyebrow}
            onChange={(e) => handleChange("eyebrow", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="bs-headline"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Headline
          </label>
          <Input
            id="bs-headline"
            required
            value={story.headline}
            onChange={(e) => handleChange("headline", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="bs-lead"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Lead Paragraph
        </label>
        <Textarea
          id="bs-lead"
          required
          value={story.leadParagraph}
          onChange={(e) => handleChange("leadParagraph", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label
            htmlFor="bs-phil-title"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Philosophy Section Title
          </label>
          <Input
            id="bs-phil-title"
            required
            value={story.philosophyTitle}
            onChange={(e) => handleChange("philosophyTitle", e.target.value)}
          />
          <Textarea
            required
            aria-label="Philosophy section body"
            value={story.philosophyBody}
            onChange={(e) => handleChange("philosophyBody", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="bs-craft-title"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Craftsmanship Section Title
          </label>
          <Input
            id="bs-craft-title"
            required
            value={story.craftsmanshipTitle}
            onChange={(e) => handleChange("craftsmanshipTitle", e.target.value)}
          />
          <Textarea
            required
            aria-label="Craftsmanship section body"
            value={story.craftsmanshipBody}
            onChange={(e) => handleChange("craftsmanshipBody", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="bs-note"
          className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
        >
          Botanical Origin &amp; Formulation Transparency Note
        </label>
        <Input
          id="bs-note"
          required
          value={story.botanicalOriginNote}
          onChange={(e) => handleChange("botanicalOriginNote", e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSaving ? "Saving..." : "Save Brand Story"}</span>
        </Button>
      </div>
    </form>
  );
}

