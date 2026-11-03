import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPublicCollectionsAction } from "@/actions/collection.actions";
import { getBannersContentAction } from "@/actions/content.actions";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Curated Fragrance Collections",
  description:
    "Explore SCENTS & MISTS olfactory chapters: Altitude Botanicals, Ephemeral Petals, and Nocturnal Reserves.",
  path: "/collections",
});

export default async function CollectionsPage() {
  const [collections, banners] = await Promise.all([
    getPublicCollectionsAction(),
    getBannersContentAction(),
  ]);

  const activeBanners = banners.filter(
    (b) => b.isActive && (b.placement === "editorial" || b.placement === "collection")
  );

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <div className="border-b border-border pb-12 max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 text-accent">
          <Layers className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Olfactory Chapters</span>
        </div>
        <h1 className="heading-display text-foreground">
          Curated Fragrance Collections
        </h1>
        <p className="body-editorial text-muted-foreground">
          Each collection explores a distinct mood of the Himalayan landscape—from
          crisp morning blossom air to twilight cedarwood and warm resins.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {collections.map((collection, index) => (
          <article
            key={collection.id}
            className="grid grid-cols-1 gap-8 border border-border bg-surface-elevated lg:grid-cols-12 items-center overflow-hidden"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] w-full lg:col-span-6 bg-surface">
              <Image
                src={collection.image_url}
                alt={collection.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="p-8 sm:p-12 lg:col-span-6 space-y-6">
              <p className="eyebrow-label text-accent">
                Chapter 0{index + 1} • Curated Series
              </p>
              <h2 className="heading-section text-foreground">
                {collection.name}
              </h2>
              <p className="body-editorial text-muted-foreground">
                {collection.description}
              </p>
              <div className="pt-2">
                <Link
                  href={`/collections/${collection.slug}`}
                  className="inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Explore {collection.name}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {activeBanners.length > 0 && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-border pt-12">
          {activeBanners.map((banner) => (
            <div
              key={banner.id}
              className="flex flex-col justify-between gap-4 border border-border bg-surface p-6 sm:p-8"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-accent">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="eyebrow-label">House Dispatch</span>
                </div>
                <h3 className="font-serif text-xl text-foreground">
                  {banner.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {banner.subtitle}
                </p>
              </div>
              {banner.ctaText && banner.ctaHref && (
                <div>
                  <Link
                    href={banner.ctaHref}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent hover:underline"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </PageTransition>
  );
}

