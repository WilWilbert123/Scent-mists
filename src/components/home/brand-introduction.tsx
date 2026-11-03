"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import type { HomepageContentConfig } from "@/types/admin";
import { cn } from "@/lib/utils";

interface BrandIntroductionProps {
  content: HomepageContentConfig;
}

const PILLARS = [
  {
    numeral: "I",
    index: "01",
    tagline: "Botanical Distillation",
    title: "Pure Botanical Formulation",
    concentration: "18% – 25% Concentration",
    body: "Composed with cold-pressed citrus zest, steam-distilled wild cherry blossom petals, and aged Himalayan heartwoods for a clean, authentic scent profile that unfolds naturally across skin.",
    dossier: [
      { label: "Maceration", value: "Small-Batch Cold Cellar" },
      { label: "Extraction", value: "Supercritical CO₂ & Enfleurage" },
      { label: "Purity", value: "100% Phthalate & Nitro-Musk Free" },
    ],
    image: "/images/lifestyle/cherry-blossom-garden.webp",
    imageAlt: "Wild cherry blossom petals harvested for high-altitude botanical distillation",
    href: "/fragrance-guide",
    cta: "Formulation Standards",
  },
  {
    numeral: "II",
    index: "02",
    tagline: "Olfactory Sillage",
    title: "Enduring Skin Chemistry",
    concentration: "8 – 12 Hours Measured Longevity",
    body: "Engineered with architectural discipline across a seamless three-tier pyramid—luminous opening accords give way to an expansive floral-botanical heart and a warm cedarwood foundation.",
    dossier: [
      { label: "Evolution", value: "Tri-Phase Linear Transition" },
      { label: "Diffusion", value: "Subtle Personal Sillage" },
      { label: "Foundation", value: "Aged Deodar Cedar Heartwood" },
    ],
    image: "/images/lifestyle/altitude-botanicals-vista.webp",
    imageAlt: "High-altitude tea terraces and alpine flora shaping the heart sillage",
    href: "/shop",
    cta: "Explore Compositions",
  },
  {
    numeral: "III",
    index: "03",
    tagline: "Architectural Crystal",
    title: "Precision Mist Diffusion",
    concentration: "100 ML Optical Chamfered Flacon",
    body: "Presented in heavy chamfered optical glass with a diamond-faceted crystal stopper and a calibrated champagne-gold atomizer engineered to aerosolize a weightless, uniform veil.",
    dossier: [
      { label: "Vessel", value: "Heavy Chamfered Optical Glass" },
      { label: "Atomizer", value: "Micro-Calibrated Uniform Mist" },
      { label: "Protection", value: "UV-Shielded Formulation Flacon" },
    ],
    image: "/images/products/perfume-box.webp",
    imageAlt: "SCENTS & MISTS crystal perfume flacon in quiet morning natural light",
    href: "/about",
    cta: "House Craftsmanship",
  },
];

export function BrandIntroduction({ content }: BrandIntroductionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const current = PILLARS[activeTab];

  return (
    <section className="relative border-b border-border bg-background py-24 sm:py-32 overflow-hidden">
      {/* Subtle organic watermark grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:4rem_4rem]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* Curated Editorial Header */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end border-b border-border pb-12">
          <RevealOnScroll direction="left" className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden="true" />
              <span className="eyebrow-label">Maison Philosophy</span>
            </div>
            <h2 className="heading-display text-foreground">
              {content.brandIntroHeadline}
            </h2>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1} className="lg:col-span-5 space-y-4">
            <p className="body-editorial text-muted-foreground">
              {content.brandIntroBody}
            </p>
            <div className="flex items-center gap-6 pt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
              <span>Maison 01</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Small-Batch Reserve</span>
              <span className="h-1 w-1 rounded-full bg-accent" />
              <span>Extrait &amp; EDP</span>
            </div>
          </RevealOnScroll>
        </div>

        {/* Interactive Archival Chapter Dossier */}
        <RevealOnScroll delay={0.15}>
          {/* Chapter Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-border bg-surface/50">
            {PILLARS.map((pillar, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={pillar.index}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    "group relative flex flex-col items-start p-6 text-left transition-all duration-300 border-r border-border last:border-r-0 cursor-pointer",
                    isSelected
                      ? "bg-surface-elevated text-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                  )}
                >
                  {/* Active highlight top bar */}
                  <span
                    className={cn(
                      "absolute inset-x-0 top-0 h-[2px] transition-colors duration-300",
                      isSelected ? "bg-accent" : "bg-transparent"
                    )}
                  />

                  <div className="flex w-full items-center justify-between text-[11px] font-mono uppercase tracking-[0.22em]">
                    <span className="text-accent font-serif text-sm">
                      {pillar.numeral}
                    </span>
                    <span className="text-muted-foreground">
                      Chapter {pillar.index}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-foreground font-medium">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-mono text-muted-foreground tracking-wide">
                    {pillar.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Chapter Presentation Panel */}
          <div className="grid grid-cols-1 gap-0 border border-border bg-surface-elevated lg:grid-cols-12 overflow-hidden shadow-luxury">
            {/* Left: Botanical / Flacon Still Life */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:col-span-5 min-h-[340px] sm:min-h-[420px] bg-surface overflow-hidden">
              <Image
                key={current.image}
                src={current.image}
                alt={current.imageAlt}
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
                Archival Plate {current.numeral}
              </span>
            </div>

            {/* Right: Formulation Dossier & Architectural Specifications */}
            <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                      {current.tagline}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
                      {current.title}
                    </h3>
                  </div>
                  <span className="border border-border bg-surface px-3 py-1 text-xs font-mono text-foreground">
                    {current.concentration}
                  </span>
                </div>

                <p className="body-editorial text-muted-foreground max-w-2xl leading-relaxed">
                  {current.body}
                </p>

                {/* Technical Dossier Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/70 pt-6">
                  {current.dossier.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.label}
                      </span>
                      <p className="font-serif text-base text-foreground font-medium">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
                <span className="text-xs text-muted-foreground font-serif italic">
                  Composed in small batches for lasting impression.
                </span>
                <Link
                  href={current.href}
                  className="group inline-flex items-center gap-2.5 border border-foreground bg-foreground px-6 py-3 text-xs uppercase tracking-[0.18em] text-background transition-all hover:border-accent hover:bg-accent hover:text-white"
                >
                  <span>{current.cta}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
