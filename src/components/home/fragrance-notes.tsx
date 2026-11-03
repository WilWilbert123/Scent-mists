"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Wind, Flower2, Trees, ArrowRight } from "lucide-react";
import { SAMPLE_FRAGRANCE_PYRAMID } from "@/data/fragrance-notes";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface FragranceNotesProps {
  initialProduct?: Product;
}

export function FragranceNotes({ initialProduct }: FragranceNotesProps) {
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [activeTier, setActiveTier] = useState<number>(0);

  // Subscribe to real-time updates from Supabase `products`
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("fragrance-notes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          if (payload.new && (payload.new as Product).is_featured) {
            setProduct(payload.new as Product);
          } else if (
            payload.new &&
            (payload.new as Product).slug === "sakura-and-mountain-mist"
          ) {
            setProduct(payload.new as Product);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const tiers = [
    {
      step: "01",
      roman: "I",
      movement: "Movement I • High Volatility",
      label: "Top Notes",
      subtitle: "First 15 Minutes • Luminous Awakening",
      summary:
        "The immediate impression upon misting—crisp alpine vapour, cold-pressed citrus, and orchard blossom.",
      icon: Wind,
      notes: SAMPLE_FRAGRANCE_PYRAMID.top,
      rawNotes: product?.top_notes || [
        "Crisp Mountain Air Accord",
        "White Bergamot Mist",
        "Dewy Pear Blossom",
      ],
    },
    {
      step: "02",
      roman: "II",
      movement: "Movement II • Medium Volatility",
      label: "Heart Notes",
      subtitle: "Hours 1 to 4 • Botanical Sanctuary",
      summary:
        "The signature floral and steamed-tea core that unfolds as the composition warms against skin.",
      icon: Flower2,
      notes: SAMPLE_FRAGRANCE_PYRAMID.heart,
      rawNotes: product?.heart_notes || [
        "Wild Cherry Blossom",
        "Pink Peony Petal",
        "Silver Needle White Tea",
      ],
    },
    {
      step: "03",
      roman: "III",
      movement: "Movement III • Low Volatility Fixatives",
      label: "Base Notes",
      subtitle: "Hours 4 to 10+ • Enduring Sillage",
      summary:
        "The grounding architecture of aged Himalayan cedarwood, botanical ambrette musk, and warm labdanum resin.",
      icon: Trees,
      notes: SAMPLE_FRAGRANCE_PYRAMID.base,
      rawNotes: product?.base_notes || [
        "Cashmere Cedarwood",
        "Soft Silk Musk",
        "Warm White Amber",
      ],
    },
  ];

  const currentProductName = product?.name || "Sakura & Mountain Mist";
  const currentProductSlug = product?.slug || "sakura-and-mountain-mist";

  return (
    <section className="relative border-b border-border bg-background py-24 sm:py-32 overflow-hidden">
      {/* Subtle atmospheric background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blossom/15 blur-3xl dark:bg-blossom-muted/10"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Curated Section Header */}
        <RevealOnScroll className="mx-auto max-w-3xl text-center space-y-5">
          <div className="inline-flex items-center gap-3 border border-border/80 bg-surface/80 px-4 py-1.5 shadow-2xs">
            <span className="text-xs font-mono uppercase tracking-[0.22em] text-accent">
              The Olfactory Pyramid
            </span>
            <span className="h-3 w-px bg-border" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {currentProductName} • Eau de Parfum
            </span>
          </div>

          <h2 className="heading-display text-foreground">
            Architecture of the Scent
          </h2>

          <div className="mx-auto h-px w-20 bg-accent/60" aria-hidden="true" />

          <p className="body-editorial text-muted-foreground pt-1 text-pretty">
            {SAMPLE_FRAGRANCE_PYRAMID.disclaimer}
          </p>
        </RevealOnScroll>

        {/* Interactive Movement Stepper Tabs */}
        <div
          role="tablist"
          aria-label="Olfactory pyramid movements"
          className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-r border-border bg-surface"
        >
          {tiers.map((tier, idx) => {
            const isSelected = activeTier === idx;
            const Icon = tier.icon;
            return (
              <button
                key={tier.label}
                role="tab"
                type="button"
                aria-selected={isSelected}
                onClick={() => setActiveTier(idx)}
                className={cn(
                  "relative flex flex-col items-start gap-2 p-6 text-left transition-all duration-200 border-b md:border-b-0 md:border-r border-border last:border-r-0",
                  isSelected
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:bg-surface-elevated/50 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-[2px] transition-colors duration-200",
                    isSelected ? "bg-accent" : "bg-transparent"
                  )}
                />
                <div className="flex w-full items-center justify-between text-[11px] font-mono uppercase tracking-[0.22em]">
                  <span className="text-accent font-serif text-sm">
                    {tier.roman}
                  </span>
                  <span className="text-muted-foreground">
                    Movement 0{idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {tier.label}
                  </h3>
                  <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  {tier.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Movement Detail Panel */}
        <div className="w-full border border-border bg-surface-elevated shadow-luxury">
          {/* Movement Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border bg-surface/70 px-6 py-6 sm:px-9 sm:py-7">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-accent/40 bg-background font-serif text-xl sm:text-2xl text-accent">
                {tiers[activeTier].step}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide text-foreground">
                    {tiers[activeTier].label}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.18em] text-accent/90 font-mono">
                    • {tiers[activeTier].movement}
                  </span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {tiers[activeTier].summary}
                </p>
              </div>
            </div>

            <span className="self-start lg:self-center shrink-0 border border-border bg-background px-4 py-2 text-xs sm:text-[13px] font-mono uppercase tracking-[0.16em] text-foreground">
              {tiers[activeTier].subtitle}
            </span>
          </div>

          {/* Three Note Columns with High Precision Typography */}
          <div className="grid grid-cols-1 divide-y divide-border/70 md:grid-cols-3 md:divide-x md:divide-y-0">
            {tiers[activeTier].notes.map((note, noteIdx) => (
              <div
                key={note.name}
                className="p-7 sm:p-9 lg:p-10 flex flex-col justify-between space-y-6 transition-colors hover:bg-surface/50"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                    {note.facet ? (
                      <p className="text-xs font-mono uppercase tracking-[0.18em] text-accent">
                        {note.facet}
                      </p>
                    ) : (
                      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        Facet 0{noteIdx + 1}
                      </span>
                    )}
                    <span className="font-serif text-sm text-muted-foreground">
                      {tiers[activeTier].step}.{noteIdx + 1}
                    </span>
                  </div>

                  <h4 className="font-serif text-2xl sm:text-[1.65rem] leading-snug text-foreground">
                    {note.name}
                  </h4>

                  {note.botanicalOrigin && (
                    <p className="text-xs sm:text-[13px] font-mono tracking-wide text-foreground/80">
                      {note.botanicalOrigin}
                    </p>
                  )}
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {note.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulation Dossier Footer Bar */}
        <RevealOnScroll className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border bg-surface/60 px-6 py-5 sm:px-9 shadow-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm uppercase tracking-[0.16em] text-muted-foreground font-mono">
            <span>
              Concentration:{" "}
              <strong className="font-medium text-foreground">
                20% Eau de Parfum
              </strong>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>
              Maceration:{" "}
              <strong className="font-medium text-foreground">
                6 Weeks Cold Cellar
              </strong>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span>
              Carrier:{" "}
              <strong className="font-medium text-foreground">
                Organic Botanical Alcohol
              </strong>
            </span>
          </div>

          <Link
            href={`/products/${currentProductSlug}`}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-accent transition-colors hover:text-foreground"
          >
            <span>Explore Signature Flacon</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
