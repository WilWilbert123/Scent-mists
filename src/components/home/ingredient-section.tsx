"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { cn } from "@/lib/utils";

const BOTANICALS = [
  {
    index: "01",
    numeral: "I",
    name: "Wild Cherry Blossom",
    latinName: "Prunus Cerasoides",
    region: "Spring Alpine Valleys",
    altitude: "2,400M Elevation",
    tier: "Heart Accord",
    extraction: "Enfleurage Absolute",
    note: "Hand-harvested at early dawn bloom for a translucent, airy floralcy with delicate almond-petal softness and morning dew clarity.",
    specifications: [
      { label: "Harvest", value: "Vernal Dawn Maceration" },
      { label: "Extraction", value: "Cold Enfleurage Absolute" },
      { label: "Olfactory Arc", value: "Crisp Petal Dew & Pale Almond" },
    ],
    image: "/images/hero/botanical-sakura-petals.webp",
  },
  {
    index: "02",
    numeral: "II",
    name: "Silver Needle White Tea",
    latinName: "Camellia Sinensis",
    region: "High-Elevation Terraces",
    altitude: "1,950M Elevation",
    tier: "Botanical Core",
    extraction: "Supercritical CO₂",
    note: "Gently steamed spring tea buds that lend serene, weightless botanical structure and a clean, contemplative warmth on skin.",
    specifications: [
      { label: "Harvest", value: "First-Flush Spring Buds" },
      { label: "Extraction", value: "Low-Temperature CO₂" },
      { label: "Olfactory Arc", value: "Steamed Leaf & Herbaceous Clarity" },
    ],
    image: "/images/hero/botanical-white-tea-terraces.webp",
  },
  {
    index: "03",
    numeral: "III",
    name: "Deodar Mountain Cedar",
    latinName: "Cedrus Deodara",
    region: "High-Altitude Timberline",
    altitude: "3,100M Elevation",
    tier: "Base Foundation",
    extraction: "Aged Heartwood Distillation",
    note: "Finely aged heartwood distilled for a dry, velvety wood architecture that anchors delicate florals into an enduring trail.",
    specifications: [
      { label: "Harvest", value: "Sustainably Aged Heartwood" },
      { label: "Extraction", value: "Slow Fractional Distillation" },
      { label: "Olfactory Arc", value: "Velvety Pine Needle & Dry Cedar" },
    ],
    image: "/images/hero/botanical-deodar-timberline.webp",
  },
];

export function IngredientSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = BOTANICALS[activeIdx];

  return (
    <section className="relative border-b border-border bg-background py-24 sm:py-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* Curated Editorial Header */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end border-b border-border pb-12">
          <RevealOnScroll direction="left" className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden="true" />
              <span className="eyebrow-label">Botanical Materia Medica</span>
            </div>
            <h2 className="heading-display text-foreground">
              Raw Materials Inspired by Altitude &amp; Light
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="lg:col-span-5 space-y-4">
            <p className="body-editorial text-muted-foreground">
              Every SCENTS &amp; MISTS creation pairs volatile floral petals with
              steamed botanical leaves and noble mountain woods for balanced
              longevity.
            </p>
            <div className="flex items-center gap-6 pt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
              <span>Pure Distillation</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Mountain Origins</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Cold Cellar Maceration</span>
            </div>
          </RevealOnScroll>
        </div>

        {/* Interactive Archival Specimen Display */}
        <RevealOnScroll delay={0.15}>
          {/* Botanical Specimen Selector */}
          <div
            role="tablist"
            aria-label="Botanical specimen selector"
            className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-r border-border bg-surface"
          >
            {BOTANICALS.map((item, idx) => {
              const isSelected = activeIdx === idx;
              return (
                <button
                  key={item.index}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setActiveIdx(idx)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 p-6 text-left transition-all duration-200 border-b md:border-b-0 md:border-r border-border last:border-r-0 cursor-pointer",
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
                      {item.numeral}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {item.altitude}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-foreground font-medium">
                    {item.name}
                  </h3>

                  <p className="font-serif text-xs italic text-muted-foreground">
                    {item.latinName}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Specimen Showcase Panel with split left/right visual */}
          <div className="grid grid-cols-1 gap-0 border border-border bg-surface-elevated lg:grid-cols-12 overflow-hidden shadow-luxury">
            {/* Left: Specimen Photography */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:col-span-5 min-h-[340px] sm:min-h-[420px] bg-surface overflow-hidden">
              <Image
                key={active.image}
                src={active.image}
                alt={active.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-opacity duration-700 ease-out"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/40 pointer-events-none"
              />
              <span className="absolute bottom-4 left-4 border border-border/80 bg-background/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground backdrop-blur-xs">
                Specimen {active.numeral} • {active.region}
              </span>
            </div>

            {/* Right: Botanical Extraction Dossier */}
            <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                      {active.tier} • {active.altitude}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                      {active.name}
                    </h3>
                  </div>
                  <span className="border border-border bg-surface px-3 py-1 text-xs font-serif italic text-foreground">
                    {active.latinName}
                  </span>
                </div>

                <p className="body-editorial text-muted-foreground max-w-2xl leading-relaxed">
                  {active.note}
                </p>

                {/* Botanical Extraction Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/70 pt-6">
                  {active.specifications.map((spec) => (
                    <div key={spec.label} className="space-y-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {spec.label}
                      </span>
                      <p className="font-serif text-base text-foreground font-medium">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Traceability Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>Single-Origin Botanical Provenance</span>
                </div>
                <span>Extraction: {active.extraction}</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
