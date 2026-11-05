"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  Layers,
  Compass,
  CheckCircle2,
} from "lucide-react";
import type { Collection } from "@/types/collection";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/products/product-card";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CollectionSectionProps {
  collections: Collection[];
  products: Product[];
}

const CHAPTER_ROMAN = ["I", "II", "III", "IV"];

export function CollectionSection({
  collections,
  products,
}: CollectionSectionProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"matrix" | "spotlight">("matrix");
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [dossierProduct, setDossierProduct] = useState<Product | null>(null);

  // Unique fragrance families
  const families = [
    "All",
    ...Array.from(new Set(products.map((p) => p.fragrance_family).filter(Boolean))),
  ];

  // Filtered products
  const filteredProducts =
    selectedFamily === "All"
      ? products
      : products.filter((p) => p.fragrance_family === selectedFamily);

  const currentSpotlight =
    products[spotlightIndex] || products[0];

  const currentSpotlightTop = currentSpotlight?.top_notes || [];
  const currentSpotlightHeart = currentSpotlight?.heart_notes || [];
  const currentSpotlightBase = currentSpotlight?.base_notes || [];

  return (
    <section className="relative border-b border-border bg-background py-24 sm:py-32 overflow-hidden">
      {/* Subtle organic watermark grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:4rem_4rem]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {/* Curated Editorial Header */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end border-b border-border pb-12">
          <RevealOnScroll direction="left" className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden="true" />
              <span className="eyebrow-label">House Portfolio • Haute Parfumerie</span>
            </div>
            <h2 className="heading-display text-foreground">
              The Fragrance Compositions
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="lg:col-span-5 space-y-4">
            <p className="body-editorial text-muted-foreground">
              Four distinct botanical studies formulated between 18% and 25%
              concentration in high-altitude cold cellars. Each flacon captures an
              ephemeral natural movement—from high-altitude mountain air to
              nocturnal amber warmth.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
              <span>4 Compositions</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>100 ML Flacons</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Cold Cellar Maceration</span>
            </div>
          </RevealOnScroll>
        </div>

        {/* Interactive Curation Navigation Bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-6">
          {/* Olfactory Family Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {families.map((family) => {
              const count =
                family === "All"
                  ? products.length
                  : products.filter((p) => p.fragrance_family === family).length;
              const isActive = selectedFamily === family;

              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => setSelectedFamily(family)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-1.5 text-xs uppercase tracking-[0.18em] transition-all duration-300 font-mono cursor-pointer border",
                    isActive
                      ? "border-foreground bg-foreground text-background font-medium shadow-xs"
                      : "border-border/80 bg-surface/50 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  <span>{family}</span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isActive ? "text-background/80" : "text-muted-foreground/60"
                    )}
                  >
                    (0{count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Modes & Catalog Link */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center border border-border/80 bg-surface/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                title="Curated Exhibition Grid"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer",
                  viewMode === "matrix"
                    ? "bg-background text-foreground shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Exhibition</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("spotlight")}
                title="Interactive Olfactory Spotlight"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer",
                  viewMode === "spotlight"
                    ? "bg-background text-foreground shadow-xs font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Spotlight</span>
              </button>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] font-medium text-foreground hover:text-accent transition-colors"
            >
              <span>View All ({products.length})</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Presentation View 1: Curated Exhibition Matrix */}
        {viewMode === "matrix" && (
          <div className="space-y-12">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  editionIndex={index}
                  onOpenDossier={(p) => setDossierProduct(p)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="border border-border/80 bg-surface-elevated p-12 text-center space-y-3">
                <p className="font-serif text-xl text-foreground">
                  No compositions matching &ldquo;{selectedFamily}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFamily("All")}
                  className="text-xs uppercase tracking-[0.18em] text-accent hover:underline cursor-pointer"
                >
                  Reset Olfactory Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Presentation View 2: Interactive Olfactory Spotlight */}
        {viewMode === "spotlight" && currentSpotlight && (
          <RevealOnScroll className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 border border-border/80 bg-surface-elevated overflow-hidden shadow-luxury">
              {/* Left Flacon Stage */}
              <div className="lg:col-span-5 relative bg-gradient-to-b from-surface via-surface/50 to-surface-elevated p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/80">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] font-mono text-muted-foreground">
                  <span className="text-accent font-medium">
                    N° 0{spotlightIndex + 1}
                  </span>
                  <span>{currentSpotlight.fragrance_family}</span>
                  <span>{currentSpotlight.volume_display || "100 ML"}</span>
                </div>

                <div className="relative aspect-[4/5] my-6 w-full max-w-sm mx-auto overflow-hidden">
                  <Image
                    src={currentSpotlight.image_url}
                    alt={currentSpotlight.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out"
                    priority
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-mono text-muted-foreground">
                  <span>Standard 100 ML Flacon</span>
                  <span className="text-foreground font-medium">
                    {currentSpotlight.concentration || "Eau de Parfum"}
                  </span>
                </div>
              </div>

              {/* Right Olfactory Dossier */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] font-mono text-accent">
                      {currentSpotlight.subtitle || currentSpotlight.fragrance_family}
                    </p>
                    <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
                      {currentSpotlight.name}
                    </h3>
                  </div>

                  {currentSpotlight.scent_profile && (
                    <blockquote className="border-l-2 border-accent pl-4 text-sm sm:text-base italic text-foreground/90 font-serif">
                      &ldquo;{currentSpotlight.scent_profile}&rdquo;
                    </blockquote>
                  )}

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {currentSpotlight.description}
                  </p>
                </div>

                {/* Structured Olfactory Pyramid Tiers */}
                <div className="space-y-4 border-t border-border/80 pt-6">
                  <h4 className="text-[11px] uppercase tracking-[0.24em] font-mono text-foreground/90 flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5 text-accent" />
                    <span>Three-Tier Olfactory Architecture</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Top Tier */}
                    <div className="border border-border/70 bg-surface/60 p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                        <span className="text-muted-foreground">I. Opening</span>
                        <span className="text-accent text-[9px]">0–15 Min</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {currentSpotlightTop[0] || "Mountain Air"}
                      </p>
                      {currentSpotlightTop[1] && (
                        <p className="text-[11px] text-muted-foreground">
                          {currentSpotlightTop[1]}
                        </p>
                      )}
                    </div>

                    {/* Heart Tier */}
                    <div className="border border-border/70 bg-surface/60 p-4 space-y-1.5 border-accent/40">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                        <span className="text-accent font-medium">II. Bloom</span>
                        <span className="text-accent text-[9px]">1–4 Hours</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {currentSpotlightHeart[0] || "Botanical Heart"}
                      </p>
                      {currentSpotlightHeart[1] && (
                        <p className="text-[11px] text-muted-foreground">
                          {currentSpotlightHeart[1]}
                        </p>
                      )}
                    </div>

                    {/* Base Tier */}
                    <div className="border border-border/70 bg-surface/60 p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em]">
                        <span className="text-muted-foreground">III. Anchor</span>
                        <span className="text-accent text-[9px]">4–10+ Hours</span>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {currentSpotlightBase[0] || "Deodar Cedar"}
                      </p>
                      {currentSpotlightBase[1] && (
                        <p className="text-[11px] text-muted-foreground">
                          {currentSpotlightBase[1]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Dossier Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/80 pt-6">
                  <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
                    <span>Maceration: 6 Weeks</span>
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    <span>Carrier: Organic Grain Alcohol</span>
                  </div>

                  <Link
                    href={`/products/${currentSpotlight.slug}`}
                    className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-background hover:bg-foreground/90 transition-colors shadow-xs"
                  >
                    <span>Discover Full Flacon Experience</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Switcher Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {products.map((p, idx) => {
                const isSelected = idx === spotlightIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSpotlightIndex(idx)}
                    className={cn(
                      "flex items-center gap-3 p-3 border transition-all duration-300 text-left cursor-pointer",
                      isSelected
                        ? "border-foreground bg-surface-elevated shadow-sm"
                        : "border-border/60 bg-surface/40 hover:border-foreground/30"
                    )}
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-surface">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-mono text-accent uppercase tracking-[0.16em]">
                        N° 0{idx + 1}
                      </p>
                      <p className="text-xs font-medium text-foreground truncate">
                        {p.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>
        )}

        {/* Curated Olfactory Chapters (Collections) */}
        <div className="space-y-12 border-t border-border pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <RevealOnScroll direction="left" className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <span className="h-px w-6 bg-accent" aria-hidden="true" />
                <p className="eyebrow-label">Olfactory Chapters</p>
              </div>
              <h3 className="heading-section text-foreground">
                Curated Fragrance Collections
              </h3>
            </RevealOnScroll>
            <RevealOnScroll direction="right">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-foreground hover:text-accent transition-colors"
              >
                <span>Explore All Chapters</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {collections.map((col, idx) => {
              const chapterNum = CHAPTER_ROMAN[idx] || `${idx + 1}`;
              return (
                <RevealOnScroll
                  key={col.id}
                  delay={idx * 0.1}
                  className="group flex flex-col justify-between border border-border/80 bg-surface-elevated overflow-hidden transition-all duration-500 hover:border-accent/60 hover:shadow-luxury"
                >
                  {/* Top Chapter Header */}
                  <div className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-surface/60 font-mono">
                    <span className="font-medium text-foreground/85">
                      Chapter {chapterNum}
                    </span>
                    <span className="text-accent">
                      {col.subtitle || "Curated Series"}
                    </span>
                  </div>

                  {/* Collection Landscape Photography */}
                  <Link
                    href={`/collections/${col.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-surface"
                  >
                    <Image
                      src={col.image_url}
                      alt={`${col.name} — ${col.subtitle || "Curated Fragrance Collection"}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  </Link>

                  {/* Collection Editorial Copy */}
                  <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h4 className="font-serif text-2xl font-normal tracking-tight text-foreground">
                        <Link
                          href={`/collections/${col.slug}`}
                          className="hover:text-accent transition-colors"
                        >
                          {col.name}
                        </Link>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {col.description}
                      </p>
                    </div>

                    <Link
                      href={`/collections/${col.slug}`}
                      className="flex items-center justify-between border-t border-border/60 pt-4 text-[11px] uppercase tracking-[0.2em] font-medium text-foreground group-hover:text-accent transition-colors"
                    >
                      <span>Explore Collection</span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Olfactory Dossier Modal */}
      <Dialog
        open={Boolean(dossierProduct)}
        onOpenChange={(open) => {
          if (!open) setDossierProduct(null);
        }}
      >
        <DialogContent className="max-w-xl sm:max-w-2xl bg-surface-elevated border-border text-foreground p-6 sm:p-8">
          {dossierProduct && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-accent">
                  <span>Archival Dossier</span>
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span>{dossierProduct.fragrance_family}</span>
                </div>
                <DialogTitle className="font-serif text-2xl sm:text-3xl text-foreground">
                  {dossierProduct.name}
                </DialogTitle>
                {dossierProduct.scent_profile && (
                  <DialogDescription className="italic text-foreground/80 font-serif">
                    &ldquo;{dossierProduct.scent_profile}&rdquo;
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Dossier Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center border-y border-border/70 py-6">
                <div className="sm:col-span-4 relative aspect-[4/5] overflow-hidden border border-border/60 bg-surface">
                  <Image
                    src={dossierProduct.image_url}
                    alt={dossierProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="sm:col-span-8 space-y-4">
                  <div className="space-y-3">
                    <div className="border border-border/60 bg-surface/50 p-3">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                        Top Notes • Opening
                      </span>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {dossierProduct.top_notes?.join(" • ") || "Calabrian Bergamot"}
                      </p>
                    </div>

                    <div className="border border-border/60 bg-surface/50 p-3 border-accent/40">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-mono text-accent">
                        Heart Notes • Botanical Bloom
                      </span>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {dossierProduct.heart_notes?.join(" • ") || "Wild Cherry Blossom"}
                      </p>
                    </div>

                    <div className="border border-border/60 bg-surface/50 p-3">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-mono text-muted-foreground">
                        Base Notes • Sillage Foundation
                      </span>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {dossierProduct.base_notes?.join(" • ") || "Deodar Cedarwood"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      {dossierProduct.concentration || "20% Eau de Parfum"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      {dossierProduct.volume_display || "100 ML"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDossierProduct(null)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/products/${dossierProduct.slug}`}
                  className="inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium text-background hover:bg-foreground/90 transition-colors"
                >
                  <span>Explore Composition</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
