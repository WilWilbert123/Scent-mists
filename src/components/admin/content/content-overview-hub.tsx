"use client";

import React, { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Megaphone,
  BookOpen,
  Database,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import type { SiteContentOverview } from "@/actions/content.actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDisplayDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { ExportButton } from "@/components/admin/shared/export-button";

interface ContentOverviewHubProps {
  overview: SiteContentOverview;
}

export function ContentOverviewHub({ overview }: ContentOverviewHubProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-site-content-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const persistedCount = [
    overview.homepage.persistedInDatabase,
    overview.banners.persistedInDatabase,
    overview.brandStory.persistedInDatabase,
  ].filter(Boolean).length;

  const activeBannersCount = overview.banners.value.filter(
    (b) => b.isActive
  ).length;

  const featuredProduct = overview.publishedProducts.find(
    (p) => p.slug === overview.homepage.value.featuredFragranceSlug
  );

  const modules = [
    {
      key: overview.homepage.key,
      title: "Homepage & Hero Editor",
      description:
        "Manage the announcement bar, hero headline, supporting copy, CTA buttons, and featured fragrance.",
      href: "/admin/content/homepage",
      publicHref: "/",
      publicLabel: "Preview /",
      icon: FileText,
      updatedAt: overview.homepage.updatedAt,
      persisted: overview.homepage.persistedInDatabase,
      highlights: [
        {
          label: "Hero Headline",
          value: `${overview.homepage.value.heroHeadline} — ${overview.homepage.value.heroSubheadline}`,
        },
        {
          label: "Announcement Bar",
          value: overview.homepage.value.announcementEnabled
            ? `Enabled: "${overview.homepage.value.announcementText}"`
            : "Disabled",
        },
        {
          label: "Featured Fragrance",
          value: featuredProduct
            ? `${featuredProduct.name} (/products/${featuredProduct.slug})`
            : `/products/${overview.homepage.value.featuredFragranceSlug}`,
        },
      ],
    },
    {
      key: overview.banners.key,
      title: "Promotional & Editorial Banners",
      description:
        "Manage announcement and editorial callout banners displayed across the public website.",
      href: "/admin/content/banners",
      publicHref: "/collections",
      publicLabel: "Preview /collections",
      icon: Megaphone,
      updatedAt: overview.banners.updatedAt,
      persisted: overview.banners.persistedInDatabase,
      highlights: [
        {
          label: "Configured Banners",
          value: `${activeBannersCount} active of ${overview.banners.value.length} total banners`,
        },
        {
          label: "Primary Banner",
          value:
            overview.banners.value[0]?.title || "No promotional banners configured",
        },
        {
          label: "Editorial Callout",
          value:
            overview.banners.value[1]?.title ||
            overview.banners.value[0]?.subtitle ||
            "—",
        },
      ],
    },
    {
      key: overview.brandStory.key,
      title: "Brand Story & Philosophy",
      description:
        "Edit the narrative, philosophy, and craftsmanship sections presented on /about.",
      href: "/admin/content/brand-story",
      publicHref: "/about",
      publicLabel: "Preview /about",
      icon: BookOpen,
      updatedAt: overview.brandStory.updatedAt,
      persisted: overview.brandStory.persistedInDatabase,
      highlights: [
        {
          label: "Story Headline",
          value: overview.brandStory.value.headline,
        },
        {
          label: "Philosophy Chapter",
          value: overview.brandStory.value.philosophyTitle,
        },
        {
          label: "Craftsmanship Chapter",
          value: overview.brandStory.value.craftsmanshipTitle,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Supabase Connection Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <span>
            Live <code className="font-mono">public.site_content</code> table in Supabase • All 3 CMS modules read and write directly to your database.
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <ExportButton
            filename="scents-mists-site-content"
            sheetName="Content"
            headers={[
              "Module / Section",
              "Primary Title",
              "Subtitle / Category",
              "Status",
              "Detail / Description",
              "Storage Source",
              "Last Synced",
            ]}
            rows={[
              [
                "Homepage Hero",
                overview.homepage.value.heroHeadline,
                overview.homepage.value.heroSubheadline,
                "Published",
                overview.homepage.value.heroDescription?.slice(0, 80) + "...",
                overview.homepage.persistedInDatabase ? "Supabase (Live)" : "Default Fallback",
                overview.homepage.updatedAt ? new Date(overview.homepage.updatedAt).toLocaleString() : "—",
              ],
              [
                "Announcement Bar",
                overview.homepage.value.announcementText || "—",
                overview.homepage.value.announcementLinkHref || "—",
                overview.homepage.value.announcementEnabled ? "Enabled" : "Disabled",
                overview.homepage.value.announcementLinkText || "—",
                overview.homepage.persistedInDatabase ? "Supabase (Live)" : "Default Fallback",
                overview.homepage.updatedAt ? new Date(overview.homepage.updatedAt).toLocaleString() : "—",
              ],
              [
                "Brand Story",
                overview.brandStory.value.headline,
                overview.brandStory.value.craftsmanshipTitle,
                "Published",
                overview.brandStory.value.leadParagraph?.slice(0, 80) + "...",
                overview.brandStory.persistedInDatabase ? "Supabase (Live)" : "Default Fallback",
                overview.brandStory.updatedAt ? new Date(overview.brandStory.updatedAt).toLocaleString() : "—",
              ],
              ...overview.banners.value.map((b, idx) => [
                `Banner #${idx + 1} (${b.placement})`,
                b.title,
                b.subtitle || "—",
                b.isActive ? "Active" : "Inactive",
                b.ctaHref ? `${b.ctaText || "Link"}: ${b.ctaHref}` : "—",
                overview.banners.persistedInDatabase ? "Supabase (Live)" : "Default Fallback",
                overview.banners.updatedAt ? new Date(overview.banners.updatedAt).toLocaleString() : "—",
              ]),
            ]}
            label="Export Content"
          />

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent"
          >
            <RefreshCw
              className={cn("h-3 w-3", isPending && "animate-spin text-accent")}
              aria-hidden="true"
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live CMS KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Synced CMS Keys"
          value={`${persistedCount} / 3`}
          subtitle="homepage, banners, brand_story"
        />
        <StatCard
          label="Announcement Bar"
          value={
            overview.homepage.value.announcementEnabled ? "Enabled" : "Hidden"
          }
          subtitle={overview.homepage.value.announcementLinkHref}
        />
        <StatCard
          label="Active Banners"
          value={`${activeBannersCount} / ${overview.banners.value.length}`}
          subtitle="Stored in site_content.banners"
        />
        <StatCard
          label="Featured Hero Scent"
          value={featuredProduct ? featuredProduct.name : overview.homepage.value.featuredFragranceSlug}
          subtitle={`/products/${overview.homepage.value.featuredFragranceSlug}`}
        />
      </div>

      {/* Live Module Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.href}
              className="group flex flex-col justify-between border border-border bg-surface-elevated p-6 transition-colors hover:border-accent"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center border border-accent/40 bg-surface text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      key: {mod.key}
                    </span>
                    <Badge variant={mod.persisted ? "success" : "warning"}>
                      {mod.persisted ? "Live DB" : "Unsaved"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-2xl text-foreground">
                    {mod.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {mod.description}
                  </p>
                </div>

                {/* Live Values Snapshot from Supabase */}
                <div className="space-y-2.5 border-y border-border/70 py-3.5 text-xs">
                  {mod.highlights.map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.label}
                      </span>
                      <p className="line-clamp-1 font-medium text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Last synced:{" "}
                  <span className="text-foreground">
                    {mod.updatedAt
                      ? formatDisplayDateTime(mod.updatedAt)
                      : "Just initialized"}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                <Link
                  href={mod.href}
                  className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent hover:underline"
                >
                  <span>Open Editor</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href={mod.publicHref}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                >
                  <span>{mod.publicLabel}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

