"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flower2, Droplets, Wind } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface OlfactoryMatrixProps {
  products: Product[];
}

interface FamilyMeta {
  family: string;
  character: string;
  mood: string;
  recommendedSeason: string;
}

const FAMILY_METADATA: Record<string, FamilyMeta> = {
  "Floral Musky": {
    family: "Floral Musky",
    character: "Translucent petals, airy dew, skin-close silk musk",
    mood: "Contemplative, luminous, weightless elegance",
    recommendedSeason: "Spring & Morning Wear",
  },
  "Woody Aromatic": {
    family: "Woody Aromatic",
    character: "High-altitude cedarwood, cool mineral vapour, resinous needles",
    mood: "Grounded, meditative, architectural solitude",
    recommendedSeason: "Year-Round & Dusk Wear",
  },
  "Floral Green": {
    family: "Floral Green",
    character: "Steamed silver-needle tea, snow lotus accord, crisp linen",
    mood: "Serene, clarifying, restorative morning calm",
    recommendedSeason: "High Summer & Warm Hours",
  },
  "Amber Floral": {
    family: "Amber Floral",
    character: "Nocturnal sakura petals, warm labdanum resin, roasted tonka",
    mood: "Sensual, opulent, intimate velvet twilight",
    recommendedSeason: "Autumn, Winter & Evening Wear",
  },
};

export function OlfactoryMatrix({ products }: OlfactoryMatrixProps) {
  // Curate 4 distinct signature creations representing key olfactory families
  const showcaseProducts = React.useMemo(() => {
    if (products.length <= 4) return products;
    const seen = new Set<string>();
    const curated: Product[] = [];
    for (const p of products) {
      if (!seen.has(p.fragrance_family) && curated.length < 4) {
        seen.add(p.fragrance_family);
        curated.push(p);
      }
    }
    for (const p of products) {
      if (curated.length < 4 && !curated.some((c) => c.id === p.id)) {
        curated.push(p);
      }
    }
    return curated;
  }, [products]);

  const [selectedSlug, setSelectedSlug] = useState<string>(
    showcaseProducts[0]?.slug || products[0]?.slug || "sakura-and-mountain-mist"
  );

  const activeProduct =
    products.find((p) => p.slug === selectedSlug) || showcaseProducts[0] || products[0];

  const meta =
    FAMILY_METADATA[activeProduct?.fragrance_family || "Floral Musky"] || {
      family: activeProduct?.fragrance_family || "Fine Fragrance",
      character: "Botanical extracts and noble woods composed in harmony",
      mood: "Elegance, balance, lasting impression",
      recommendedSeason: "Daily Ritual",
    };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
      {/* 4 Interactive Family Cards */}
      <div
        role="tablist"
        aria-label="Fragrance families"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
      >
        {showcaseProducts.map((product) => {
          const isSelected = product.slug === selectedSlug;
          const familyInfo = FAMILY_METADATA[product.fragrance_family];

          return (
            <button
              key={product.id}
              role="tab"
              type="button"
              aria-selected={isSelected}
              onClick={() => setSelectedSlug(product.slug)}
              className={cn(
                "group relative flex flex-col justify-between p-4 sm:p-6 text-left border transition-all duration-300 rounded-xl sm:rounded-none w-full max-w-full overflow-hidden cursor-pointer",
                isSelected
                  ? "border-accent bg-surface-elevated ring-1 ring-accent/60 shadow-luxury"
                  : "border-border bg-surface hover:border-accent/40 hover:bg-surface-elevated/70"
              )}
            >
              {/* Highlight bar */}
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-[2px] transition-colors duration-200",
                  isSelected ? "bg-accent" : "bg-transparent"
                )}
              />

              <div className="space-y-2.5 sm:space-y-3 w-full min-w-0">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.18em]">
                  <span className="text-accent">
                    {product.is_featured ? "Signature" : "Chapter"}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    100 ML EDP
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl text-foreground font-medium break-words">
                  {product.fragrance_family}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {familyInfo?.character || product.description}
                </p>
              </div>

              <div className="border-t border-border/70 pt-3 sm:pt-4 mt-4 sm:mt-6 flex items-center justify-between w-full min-w-0">
                <span className="font-serif text-xs text-foreground font-medium truncate flex-1 min-w-0 pr-2">
                  {product.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em] transition-colors font-mono shrink-0",
                    isSelected ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {isSelected ? "Active" : "Inspect"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Fragrance Composition Blueprint */}
      {activeProduct && (
        <article className="border border-border bg-surface-elevated p-4 sm:p-8 lg:p-12 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center rounded-2xl sm:rounded-none w-full max-w-full overflow-hidden">
          {/* Flacon Visual */}
          <div className="lg:col-span-5 relative aspect-[4/5] min-h-[260px] sm:min-h-[340px] w-full border border-border/80 bg-surface overflow-hidden rounded-xl sm:rounded-none">
            <Image
              src={activeProduct.image_url}
              alt={`${activeProduct.name} flacon`}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none"
            />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 border border-border/80 bg-background/85 p-2.5 sm:p-3.5 backdrop-blur-xs flex items-center justify-between text-xs rounded-lg sm:rounded-none">
              <div className="min-w-0 flex-1 pr-2">
                <p className="font-serif text-sm sm:text-base text-foreground font-medium truncate">
                  {activeProduct.name}
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                  {activeProduct.fragrance_family} • 20% EDP
                </p>
              </div>
              <Link
                href={`/products/${activeProduct.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 bg-foreground text-background px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-accent hover:text-white transition-colors"
              >
                <span>Dossier</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Three-Tier Pyramid Decomposition */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 w-full min-w-0">
            <div className="space-y-2 sm:space-y-3 border-b border-border/80 pb-4 sm:pb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Olfactory Family Blueprint
                </span>
                <span className="border border-border bg-surface px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                  {meta.recommendedSeason}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl text-foreground font-normal break-words">
                {activeProduct.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeProduct.description}
              </p>
            </div>

            {/* Three-Tier Notes Breakdown */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Evolution On Skin
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Top Notes */}
                <div className="border border-border bg-surface p-3.5 sm:p-4 space-y-2 rounded-xl sm:rounded-none">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Wind className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Top (0–15 Min)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.top_notes?.map((n) => (
                      <li key={n} className="leading-snug break-words">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Heart Notes */}
                <div className="border border-border bg-surface p-3.5 sm:p-4 space-y-2 rounded-xl sm:rounded-none">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Flower2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Heart (20M–4 Hrs)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.heart_notes?.map((n) => (
                      <li key={n} className="leading-snug break-words">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Base Notes */}
                <div className="border border-border bg-surface p-3.5 sm:p-4 space-y-2 rounded-xl sm:rounded-none">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Droplets className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Base (4–12+ Hrs)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.base_notes?.map((n) => (
                      <li key={n} className="leading-snug break-words">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Direct Links */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full">
              <Link
                href={`/products/${activeProduct.slug}`}
                className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-4 sm:px-6 py-3 text-xs uppercase tracking-[0.16em] text-background transition-colors hover:border-accent hover:bg-accent hover:text-white rounded-lg sm:rounded-none text-center"
              >
                <span className="truncate max-w-[200px] sm:max-w-xs">Experience {activeProduct.name}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-border bg-surface px-4 sm:px-6 py-3 text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent rounded-lg sm:rounded-none text-center"
              >
                <span>Compare All Compositions</span>
              </Link>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

