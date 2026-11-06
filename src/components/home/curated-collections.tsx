"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

const CATEGORIES = [
  {
    title: "50ml Aroma Body Mists",
    category: "Daily Essentials",
    priceRange: "₱135 Each",
    count: "23 Fragrances Available",
    description:
      "Lightweight, uplifting daily fragrance mists formulated with fine perfume oils. Perfect for casual daytime freshness, work, or gym.",
    image: "/images/lifestyle/cherry-blossom-garden.webp",
    badges: ["Long-Lasting Oils", "Everyday Wear", "Best Value"],
    href: "/shop",
  },
  {
    title: "85ml Victoria's Secret Luxe",
    category: "Sensual Designer",
    priceRange: "₱200 Each",
    count: "13 Fragrances Available",
    description:
      "Iconic, seductive designer profiles including Bombshell, Love Spell, and Pink Chiffon. Formulated for intimate sillage and all-night allure.",
    image: "/images/lifestyle/collection-nocturnal-reserves.webp",
    badges: ["Seductive Florals", "Warm Vanilla", "Evening Sillage"],
    href: "/shop",
  },
  {
    title: "Curated Male Accords",
    category: "Masculine Picks",
    priceRange: "₱135 – ₱200",
    count: "5 Distinct Scents",
    description:
      "Crisp, commanding accords for modern gentlemen—including Bvlgari Man in Black, Calvin Klein Eternity, and Clinique Happy.",
    image: "/images/lifestyle/altitude-botanicals-vista.webp",
    badges: ["Woody Cedar", "Clean Citrus", "Crisp Spice"],
    href: "/shop",
  },
  {
    title: "The Botanical Signature",
    category: "Haute Parfumerie",
    priceRange: "Exclusive House Editions",
    count: "Small-Batch Reserve",
    description:
      "Formulated with cold-distilled wild cherry blossom, steamed high-altitude white tea, and aged Himalayan cedarwood.",
    image: "/images/products/perfume-box.webp",
    badges: ["Cold Maceration", "Optical Crystal Flacon", "Pure Essence"],
    href: "/shop",
  },
];

export function CuratedCollections() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/80 pb-8">
          <RevealOnScroll direction="left" className="space-y-3">
            <div className="flex items-center gap-2 text-accent">

              <span className="eyebrow-label">Curated Olfactory Worlds</span>
            </div>
            <h2 className="heading-section text-foreground">
              Explore Our Signature Collections
            </h2>
            <p className="max-w-xl text-xs sm:text-sm text-muted-foreground">
              From invigorating 50ml body mists to magnetic 85ml Victoria&apos;s Secret creations, find your personal signature aroma.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.1}>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent hover:text-foreground transition-colors group cursor-pointer"
            >
              <span>View Full 36 Scent Catalog</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealOnScroll>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CATEGORIES.map((cat, idx) => (
            <RevealOnScroll
              key={cat.title}
              delay={idx * 0.1}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated transition-all duration-500 hover:border-accent/60 hover:shadow-luxury"
            >
              {/* Image Preview Banner */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-xs rounded-md">
                    {cat.category}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <p className="font-mono text-[11px] text-accent-light uppercase tracking-wider">
                      {cat.count}
                    </p>
                    <p className="font-serif text-lg sm:text-xl font-medium">
                      {cat.priceRange}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col justify-between p-6 sm:p-8 flex-1 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground group-hover:text-accent transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {cat.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-border/70 bg-surface px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <Link
                    href={cat.href}
                    className="inline-flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-accent hover:border-accent hover:text-white transition-all cursor-pointer"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

