"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ExternalLink, Database } from "lucide-react";
import type { HomepageContentConfig } from "@/types/admin";
import { updateHomepageContentAction } from "@/actions/content.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface HomepageEditorProps {
  initialContent: HomepageContentConfig;
  updatedAt?: string | null;
  publishedProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    is_featured: boolean;
  }>;
}

export function HomepageEditor({
  initialContent,
  updatedAt,
  publishedProducts = [],
}: HomepageEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<HomepageContentConfig>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-homepage-editor-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_content",
          filter: "content_key=eq.homepage",
        },
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

  const handleChange = <K extends keyof HomepageContentConfig>(
    key: K,
    value: HomepageContentConfig[K]
  ) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateHomepageContentAction(content);
      if (!res.success) {
        toast.error(res.error || "Unable to save homepage content.");
        return;
      }
      toast.success("Homepage content updated in Supabase and published to /.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 border border-border bg-surface-elevated p-6 sm:p-8"
    >
      {/* Live Supabase Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Database key: <code className="font-mono">site_content.homepage</code>
            {updatedAt ? ` • Last synced ${formatDisplayDateTime(updatedAt)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent"
          >
            <span>Preview Homepage</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Announcement Bar Settings */}
      <div className="space-y-4 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-foreground">
            Top Announcement Bar
          </h3>
          <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={content.announcementEnabled}
              onChange={(e) =>
                handleChange("announcementEnabled", e.target.checked)
              }
              className="h-4 w-4"
            />
            <span>Enable Announcement Bar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3 space-y-1.5">
            <label
              htmlFor="hp-ann-text"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Announcement Text
            </label>
            <Input
              id="hp-ann-text"
              value={content.announcementText}
              onChange={(e) => handleChange("announcementText", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="hp-ann-link"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Link Label
            </label>
            <Input
              id="hp-ann-link"
              value={content.announcementLinkText}
              onChange={(e) =>
                handleChange("announcementLinkText", e.target.value)
              }
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="hp-ann-href"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Link Destination Route
            </label>
            <Input
              id="hp-ann-href"
              value={content.announcementLinkHref}
              onChange={(e) =>
                handleChange("announcementLinkHref", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Hero Section Settings */}
      <div className="space-y-4 border-b border-border pb-6">
        <h3 className="font-serif text-xl text-foreground">
          Hero Section &amp; Primary Call-to-Actions
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="hp-eyebrow"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Hero Eyebrow Label
            </label>
            <Input
              id="hp-eyebrow"
              required
              value={content.heroEyebrow}
              onChange={(e) => handleChange("heroEyebrow", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="hp-subheadline"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Supporting Subheadline
            </label>
            <Input
              id="hp-subheadline"
              required
              value={content.heroSubheadline}
              onChange={(e) => handleChange("heroSubheadline", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="hp-headline"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Main Hero Headline
          </label>
          <Input
            id="hp-headline"
            required
            value={content.heroHeadline}
            onChange={(e) => handleChange("heroHeadline", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="hp-desc"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Hero Supporting Description
          </label>
          <Textarea
            id="hp-desc"
            required
            value={content.heroDescription}
            onChange={(e) => handleChange("heroDescription", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="hp-cta1"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Primary CTA Text
            </label>
            <Input
              id="hp-cta1"
              required
              value={content.heroPrimaryCtaText}
              onChange={(e) =>
                handleChange("heroPrimaryCtaText", e.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="hp-cta1-href"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Primary CTA Route
            </label>
            <Input
              id="hp-cta1-href"
              required
              value={content.heroPrimaryCtaHref}
              onChange={(e) =>
                handleChange("heroPrimaryCtaHref", e.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="hp-cta2"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Secondary CTA Text
            </label>
            <Input
              id="hp-cta2"
              required
              value={content.heroSecondaryCtaText}
              onChange={(e) =>
                handleChange("heroSecondaryCtaText", e.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="hp-cta2-href"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Secondary CTA Route
            </label>
            <Input
              id="hp-cta2-href"
              required
              value={content.heroSecondaryCtaHref}
              onChange={(e) =>
                handleChange("heroSecondaryCtaHref", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Brand Introduction Settings */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl text-foreground">
          Brand Introduction &amp; Featured Fragrance
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="hp-intro-head"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Brand Introduction Headline
            </label>
            <Input
              id="hp-intro-head"
              required
              value={content.brandIntroHeadline}
              onChange={(e) =>
                handleChange("brandIntroHeadline", e.target.value)
              }
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="hp-feat-slug"
              className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
            >
              Featured Fragrance (from <code className="font-mono">public.products</code>)
            </label>
            {publishedProducts.length > 0 ? (
              <Select
                id="hp-feat-slug"
                value={content.featuredFragranceSlug}
                onChange={(e) => {
                  const nextSlug = e.target.value;
                  handleChange("featuredFragranceSlug", nextSlug);
                  handleChange("heroPrimaryCtaHref", `/products/${nextSlug}`);
                }}
              >
                {publishedProducts.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} (/products/{p.slug})
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id="hp-feat-slug"
                required
                value={content.featuredFragranceSlug}
                onChange={(e) =>
                  handleChange("featuredFragranceSlug", e.target.value)
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="hp-intro-body"
            className="block text-xs uppercase tracking-[0.14em] text-foreground font-medium"
          >
            Brand Introduction Paragraph
          </label>
          <Textarea
            id="hp-intro-body"
            required
            value={content.brandIntroBody}
            onChange={(e) => handleChange("brandIntroBody", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSaving ? "Saving..." : "Save Homepage Content"}</span>
        </Button>
      </div>
    </form>
  );
}

