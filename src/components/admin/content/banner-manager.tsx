"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Database, ExternalLink } from "lucide-react";
import type { BannerItemConfig } from "@/types/admin";
import { updateBannersContentAction } from "@/actions/content.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface BannerManagerProps {
  initialBanners: BannerItemConfig[];
  updatedAt?: string | null;
}

export function BannerManager({ initialBanners, updatedAt }: BannerManagerProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItemConfig[]>(initialBanners);
  const [isSaving, setIsSaving] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

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
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const handleAddBanner = () => {
    setBanners((prev) => [
      ...prev,
      {
        id: `banner-${Date.now()}`,
        title: "New Showcase Banner",
        subtitle: "Explore our high-altitude botanical perfume archive.",
        ctaText: "Discover More",
        ctaHref: "/collections",
        isActive: true,
        placement: "editorial",
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
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
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Database key: <code className="font-mono">site_content.banners</code>
            {updatedAt ? ` • Last synced ${formatDisplayDateTime(updatedAt)}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/collections"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent"
          >
            <span>Preview Collections</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </Link>
          <Button type="button" variant="outline" size="sm" onClick={handleAddBanner}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Banner</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="border border-border bg-surface-elevated p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <span className="font-serif text-lg text-foreground">
                  Banner #{index + 1}
                </span>
                <Select
                  value={banner.placement}
                  onChange={(e) =>
                    handleUpdate(
                      banner.id,
                      "placement",
                      e.target.value as BannerItemConfig["placement"]
                    )
                  }
                  aria-label="Banner placement"
                  className="h-8 w-44 text-xs"
                >
                  <option value="announcement">Placement: Announcement</option>
                  <option value="editorial">Placement: Editorial Callout</option>
                  <option value="collection">Placement: Collection Page</option>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banner.isActive}
                    onChange={(e) =>
                      handleUpdate(banner.id, "isActive", e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <span>Active on Website</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(banner.id)}
                  aria-label={`Remove banner ${banner.title}`}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  Banner Title
                </label>
                <Input
                  value={banner.title}
                  onChange={(e) =>
                    handleUpdate(banner.id, "title", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  Subtitle
                </label>
                <Input
                  value={banner.subtitle}
                  onChange={(e) =>
                    handleUpdate(banner.id, "subtitle", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  CTA Button Label
                </label>
                <Input
                  value={banner.ctaText}
                  onChange={(e) =>
                    handleUpdate(banner.id, "ctaText", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                  CTA Target Route
                </label>
                <Input
                  value={banner.ctaHref}
                  onChange={(e) =>
                    handleUpdate(banner.id, "ctaHref", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isSaving ? "Saving..." : "Save Banner Configuration"}</span>
        </Button>
      </div>
    </form>
  );
}

