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
  const [selectedSlug, setSelectedSlug] = useState<string>(
    products[0]?.slug || "sakura-and-mountain-mist"
  );

  const activeProduct =
    products.find((p) => p.slug === selectedSlug) || products[0];

  const meta =
    FAMILY_METADATA[activeProduct?.fragrance_family || "Floral Musky"] || {
      family: activeProduct?.fragrance_family || "Fine Fragrance",
      character: "Botanical extracts and noble woods composed in harmony",
      mood: "Elegance, balance, lasting impression",
      recommendedSeason: "Daily Ritual",
    };

  return (
    <div className="space-y-8">
      {/* 4 Interactive Family Cards */}
      <div
        role="tablist"
        aria-label="Fragrance families"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {products.map((product) => {
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
                "group relative flex flex-col justify-between p-6 text-left border transition-all duration-300",
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

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.18em]">
                  <span className="text-accent">
                    {product.is_featured ? "Signature" : "Chapter"}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    100 ML EDP
                  </span>
                </div>

                <h3 className="font-serif text-xl text-foreground font-medium">
                  {product.fragrance_family}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {familyInfo?.character || product.description}
                </p>
              </div>

              <div className="border-t border-border/70 pt-4 mt-6 flex items-center justify-between w-full">
                <span className="font-serif text-xs text-foreground font-medium truncate max-w-[140px]">
                  {product.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em] transition-colors font-mono",
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
        <article className="border border-border bg-surface-elevated p-8 sm:p-12 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Flacon Visual */}
          <div className="lg:col-span-5 relative aspect-[4/5] min-h-[340px] w-full border border-border/80 bg-surface overflow-hidden">
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
            <div className="absolute bottom-4 left-4 right-4 border border-border/80 bg-background/85 p-3.5 backdrop-blur-xs flex items-center justify-between text-xs">
              <div>
                <p className="font-serif text-base text-foreground font-medium">
                  {activeProduct.name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {activeProduct.fragrance_family} • 20% EDP
                </p>
              </div>
              <Link
                href={`/products/${activeProduct.slug}`}
                className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-accent hover:text-white transition-colors"
              >
                <span>Dossier</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Three-Tier Pyramid Decomposition */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3 border-b border-border/80 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  Olfactory Family Blueprint
                </span>
                <span className="border border-border bg-surface px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                  {meta.recommendedSeason}
                </span>
              </div>
              <h3 className="heading-display text-foreground">
                {activeProduct.name}
              </h3>
              <p className="body-editorial text-muted-foreground">
                {activeProduct.description}
              </p>
            </div>

            {/* Three-Tier Notes Breakdown */}
            <div className="space-y-4">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Evolution On Skin
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Top Notes */}
                <div className="border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Wind className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Top (0–15 Min)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.top_notes?.map((n) => (
                      <li key={n} className="leading-snug">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Heart Notes */}
                <div className="border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Heart (20M–4 Hrs)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.heart_notes?.map((n) => (
                      <li key={n} className="leading-snug">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Base Notes */}
                <div className="border border-border bg-surface p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-accent text-xs">
                    <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">
                      Base (4–12+ Hrs)
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-foreground font-serif">
                    {activeProduct.base_notes?.map((n) => (
                      <li key={n} className="leading-snug">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Direct Links */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/products/${activeProduct.slug}`}
                className="inline-flex items-center gap-2 border border-foreground bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-background transition-colors hover:border-accent hover:bg-accent hover:text-white"
              >
                <span>Experience {activeProduct.name}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border border-border bg-surface px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent"
              >
                <span>Compare All 4 Compositions</span>
              </Link>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

