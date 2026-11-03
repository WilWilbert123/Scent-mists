"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  editionIndex?: number;
  onOpenDossier?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  editionIndex,
  onOpenDossier,
  className,
}: ProductCardProps) {
  const topNote = product.top_notes?.[0]?.replace(/\s*\(Sample\)/gi, "").trim();
  const heartNote = product.heart_notes?.[0]?.replace(/\s*\(Sample\)/gi, "").trim();
  const baseNote = product.base_notes?.[0]?.replace(/\s*\(Sample\)/gi, "").trim();

  const editionNumber =
    typeof editionIndex === "number"
      ? `0${editionIndex + 1}`
      : product.is_featured
        ? "01"
        : null;

  const concentrationLabel =
    product.concentration ||
    (product.slug === "velvet-amber-and-sakura-dusk"
      ? "Extrait de Parfum"
      : "Eau de Parfum");

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between border border-border/80 bg-surface-elevated transition-all duration-500 hover:border-accent/60 hover:shadow-luxury overflow-hidden",
        className
      )}
      style={{ containerType: "inline-size" }}
    >
      {/* Top Archival Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 sm:px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-surface/60 font-mono">
        <span className="font-medium text-foreground/85 flex items-center gap-1.5">
          {editionNumber && (
            <span className="text-accent font-semibold">N° {editionNumber} •</span>
          )}
          <span>{product.fragrance_family}</span>
        </span>
        <span className="text-muted-foreground/80">
          {product.volume_display || "100 ML"}
        </span>
      </div>

      {/* Photorealistic Flacon Stage */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-b from-surface via-surface/40 to-surface-elevated">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-full w-full"
          aria-label={`View ${product.name} details`}
        >
          <Image
            src={product.image_url}
            alt={`${product.name} — ${product.fragrance_family} ${concentrationLabel}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle Ambient Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
        </Link>

        {/* Signature Flacon Pill */}
        {product.is_featured && (
          <div className="absolute left-3.5 top-3.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 border border-border/80 bg-background/95 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-medium text-foreground shadow-xs backdrop-blur-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <span>Signature Flacon</span>
            </span>
          </div>
        )}

        {/* Quick Dossier Hover Overlay */}
        {onOpenDossier && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenDossier(product);
              }}
              className="pointer-events-auto inline-flex items-center gap-1.5 border border-border/80 bg-background/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-medium text-foreground shadow-sm backdrop-blur-xs hover:border-accent hover:text-accent transition-colors cursor-pointer"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>Olfactory Dossier</span>
            </button>
          </div>
        )}
      </div>

      {/* Editorial Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.24em] font-mono text-accent">
              {concentrationLabel}
            </p>
            {product.collection_slug && (
              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 hidden sm:inline">
                Pure Maceration
              </span>
            )}
          </div>

          <h3 className="font-serif text-2xl font-normal tracking-tight text-foreground leading-snug">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-accent transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          {product.scent_profile ? (
            <p className="text-xs sm:text-[13px] italic text-muted-foreground leading-relaxed line-clamp-2">
              &ldquo;{product.scent_profile}&rdquo;
            </p>
          ) : (
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Structured 3-Tier Olfactory Accord Progression */}
        <div className="space-y-4 border-t border-border/60 pt-4">
          <div className="grid grid-cols-3 gap-2 border border-border/50 bg-surface/50 p-2.5 text-center">
            <div className="space-y-0.5">
              <span className="block text-[8px] uppercase tracking-[0.2em] text-muted-foreground/80 font-mono">
                Opening
              </span>
              <p
                className="text-[11px] font-medium text-foreground/90 truncate"
                title={topNote || "Dewy Citrus"}
              >
                {topNote || "Dewy Citrus"}
              </p>
            </div>
            <div className="space-y-0.5 border-x border-border/50 px-1">
              <span className="block text-[8px] uppercase tracking-[0.2em] text-accent font-mono">
                Heart
              </span>
              <p
                className="text-[11px] font-medium text-foreground/90 truncate"
                title={heartNote || "Alpine Blossom"}
              >
                {heartNote || "Alpine Blossom"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="block text-[8px] uppercase tracking-[0.2em] text-muted-foreground/80 font-mono">
                Base
              </span>
              <p
                className="text-[11px] font-medium text-foreground/90 truncate"
                title={baseNote || "Mountain Cedar"}
              >
                {baseNote || "Mountain Cedar"}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-medium text-foreground hover:text-accent transition-colors group/link"
              aria-label={`Discover ${product.name}`}
            >
              <span>Explore Flacon</span>
              <ArrowRight
                className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            {onOpenDossier && (
              <button
                type="button"
                onClick={() => onOpenDossier(product)}
                className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Full Dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
